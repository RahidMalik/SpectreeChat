// src/lib/axios.js
import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000"
        : "https://spectreechatbackend-1.onrender.com";

export const axiosInstance = axios.create({
    baseURL: BASE_URL + "/api",
    withCredentials: true,
});

export default axiosInstance;
