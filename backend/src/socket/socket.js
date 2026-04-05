import { Server } from "socket.io";
import { Message } from "../models/message.models.js";
import { Channel } from "../models/channel.model.js";
import jwt from "jsonwebtoken";

const userSocketMap = new Map();

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.USER_URL || "*",
            credentials: true,
        },
    });

    // Socket Authentication Middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication Error: Token Missing"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decoded;
            next();
        }
        catch (e) {
            return next(new Error("Authentication Error: Invalid Token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Register User
        socket.on("register_user", () => {
            const userId = socket.user._id;
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
            io.emit("user_online", userId);
            socket.join(`user:${userId}`);
        });

        // Join Channel Room
        socket.on("join_channel", (channelId) => {
            if (!channelId) return;
            socket.join(channelId.toString());
            console.log(`User ${socket.user._id} joined channel ${channelId}`);
        });

        // Leave Channel Room
        socket.on("leave_channel", (channelId) => {
            if (!channelId) return;
            socket.leave(channelId.toString());
            console.log(`User ${socket.user._id} left channel ${channelId}`);
        });

        // Send Message via Socket
        socket.on("send_message", async (data) => {
            try {
                const { channelId, content, ttlMinutes, minVisibilityRole } = data;

                const channel = await Channel.findById(channelId);
                if (!channel) return socket.emit("error", "Channel not found");

                const participant = channel.participants.find(
                    (p) => p.user.toString() === socket.user._id.toString()
                );
                if (!participant) return socket.emit("error", "You are not a member of this channel");

                let expiresAt = null;
                if (ttlMinutes && ttlMinutes > 0) {
                    expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
                }

                const message = await Message.create({
                    channel: channelId,
                    sender: socket.user._id,
                    content,
                    minVisibilityRole: minVisibilityRole || "Observer",
                    expiresAt,
                });

                await Channel.findByIdAndUpdate(channelId, { lastMessage: message._id });

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "username fullName avatar");

                io.to(channelId.toString()).emit("receive_message", populatedMessage);
            } catch (e) {
                console.error("Socket send_message error:", e);
                socket.emit("error", "Failed to send message");
            }
        });

        // Typing Indicators
        socket.on("typing_start", ({ channelId }) => {
            socket.to(channelId.toString()).emit("user_typing", {
                userId: socket.user._id,
            });
        });

        socket.on("typing_stop", ({ channelId }) => {
            socket.to(channelId.toString()).emit("user_stop_typing", {
                userId: socket.user._id,
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    io.emit("user_offline", userId);
                    break;
                }
            }
            console.log("User disconnected:", socket.id);
        });
    });
    return io;
};

const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized yet");
    return io;
};

const getId = getIO;

export { initSocket, getIO, getId };