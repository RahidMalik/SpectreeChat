import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
    import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

// Load saved user from localStorage
const storedUser = JSON.parse(localStorage.getItem("authuser"));

export const userAuthStore = create((set, get) => ({
    authuser: storedUser || null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    onlineUsers: [],
    socket: null,

    //* CHECK AUTH
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authuser: res.data });
            localStorage.setItem("authuser", JSON.stringify(res.data));
            get().connectSocket();
        } catch (error) {
            console.log("error in useAuthStore", error);
            set({ authuser: null });
            localStorage.removeItem("authuser");
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    //* SIGNUP
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authuser: res.data });
            localStorage.setItem("authuser", JSON.stringify(res.data));
            toast.success("Account created successfully!");
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    //* LOGIN
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authuser: res.data });
            localStorage.setItem("authuser", JSON.stringify(res.data));
            toast.success("Logged in successfully!");
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    //* LOGOUT
    logout: async (navigate) => {
        try {
            await axiosInstance.post("/auth/logout");
            get().disconnectSocket();
            set({ authuser: null, socket: null });
            localStorage.removeItem("authuser");
            toast.success("Logged out successfully");
            if (navigate) navigate("/login");
        } catch (error) {
            toast.error("Error logging out");
            console.log("Logout error:", error);
        }
    },

    //* UPDATE PROFILE
    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/UpdateProfile", data);

            if (res.data) {
                set({ authuser: res.data });
                localStorage.setItem("authuser", JSON.stringify(res.data));
                toast.success("Profile updated successfully");
            } else {
                toast.error("Failed to get updated user data");
            }
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    },

    //* Connect Socket (ONLY handles connection & online users here)
    connectSocket: () => {
        const { authuser } = get();
        if (!authuser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("🟢 Socket connected:", socket.id);
        });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected");
        });

        set({ socket });
    },

    //* Disconnect socket safely
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            console.log("🔴 Socket disconnected by userAuthStore");
        }
        set({ socket: null });
    },
}));
