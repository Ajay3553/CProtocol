import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    //NOTE: Use the original User and channel ID stored in MongoDb otherwise while testing it will throw Error specially send_message
    socket.emit("register_user", "USE_USER_ID");

    socket.emit("join_channel", "USE_CHANNEL_ID");

    socket.emit("send_message", {
        channelId: "USE_CHANNEL_ID",
        senderId: "USE_USER_ID",
        content: "Hello World"
    });
});

socket.on("receive_message", (data) => {
    console.log("New Message:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("connect_error", (err) => {
    console.log("Connection Error:", err.message);
});