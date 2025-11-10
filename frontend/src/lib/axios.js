import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://spectreechatbackend-1.onrender.com";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"], // ✅ Important!
    autoConnect: false, // Connect manually after auth
});