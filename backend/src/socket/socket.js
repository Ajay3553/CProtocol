import {Server} from "socket.io";
import { Message } from "../models/message.models.js";
import { Channel } from "../models/channel.model.js";

const userSocketMap = new Map();

let io;
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });
    io.on("connection", (socket) => {
        console.log("User connecterd: ", socket.id);

        // Register User
        socket.on("register_user", (userId) => {
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} registered with Socket ${socket.id}`);
        })

        // Join Channel
        socket.on("join_channel", (channelId) => {
            socket.join(channelId);
            console.log(`User Joined channel ${channelId}`);
        });

        // Send Message
        socket.on("send_message", async(data) => {
            try{
                const {channelId, senderId, content} = data;
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

        socket.on("disconnect", () => {
            for(const [userId, socketId] of userSocketMap.entries()){
                if(socketId === socket.id){
                    userSocketMap.delete(userId);
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