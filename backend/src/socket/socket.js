import {Server} from "socket.io";
import { Message } from "../models/message.models.js";
import { Channel } from "../models/channel.model.js";
import jwt from "jsonwebtoken";

const userSocketMap = new Map();

let io;
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    // Socket Authentication
    io.use((socket, next) => {
        try{
            const token = socket.handshake.auth?.token;
            if(!token) return next(new Error("Authentication Error in Socekt : Token Missing"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decoded;

            next();
        }
        catch(e){
            return next(new Error("Authentication Error in Socket : Invalid Token"));
        }
    })


    io.on("connection", (socket) => {
        console.log("User connecterd: ", socket.id);

        // Register User
        socket.on("register_user", () => {
            const userId = socket.user._id;
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} registered with Socket ${socket.id}`);
            io.emit("user_online", userId);
        })

        // Join Channel
        socket.on("join_channel", (channelId) => {
            socket.join(channelId);
            console.log(`User Joined channel ${channelId}`);
        });

        // Send Message
        socket.on("send_message", async(data) => {
            try{
                const {channelId, content} = data;
                const senderId = socket.user._id;
                const channel = await Channel.findById(channelId);
                if(!channel) return socket.emit("error", "Channel not found");
                const message = await Message.create({
                    channel: channelId,
                    sender: senderId,
                    content
                });

                await Channel.findByIdAndUpdate(channelId, {
                    lastMessage: message._id
                });

                const populatedMessage = await Message.findById(message._id).populate("sender", "username email avatar");
                io.to(channelId).emit("receive_message", populatedMessage);

            }
            catch(e){
                console.log("Socket Message error : ", e);
            }
        });

        // typing Start
        socket.on("typing_start", ({channelId}) => {
            socket.to(channelId).emit("user_typing", {
                userId : socket.user._id
            });
        });

        // typing End
        socket.on("typing_stop", ({channelId}) => {
            socket.to(channelId).emit("user_stop_typing", {
                userId : socket.user._id
            });
        });


        socket.on("disconnect", () => {
            for(const [userId, socketId] of userSocketMap.entries()){
                if(socketId === socket.id){
                    userSocketMap.delete(userId);
                    io.emit("user_offline", userId);
                    break;
                }
            }
            console.log("User Disconnected:", socket.id);
        });
    });
};

const getId = () => {
    if(!io) throw new Error("Socket.io not initialized");
    return io;
}

export{
    initSocket,
    getId
}