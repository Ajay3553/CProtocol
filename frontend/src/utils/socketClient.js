import { io } from "socket.io-client"

const getToken = () => {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
}

const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", {
    withCredentials: true,
    autoConnect: false,
    auth: { token: getToken() },
})

socket.on("connect_error", (err) => {
    if (err.message.includes("Authentication")) {
        socket.auth = { token: getToken() }
    }
})

export default socket