import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://spectreechatbackend-1.onrender.com/api",
    withCredentials: true,
});
