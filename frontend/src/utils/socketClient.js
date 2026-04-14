import { io } from "socket.io-client"

const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", {
    withCredentials: true,
    autoConnect: false,
})

socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message)
})

export default socket