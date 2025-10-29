import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";


export const userAuthStore = create((set, get) => ({
    authuser: null,
    isCheckingAuth: true,
    isSigningUp: false,

    //* CHECK AUTH 
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authuser: res.data });
        } catch (error) {
            console.log("error in useAuthStore", error);
            set({ authuser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    //* SIGN UP 
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authuser: res.data });

            toast.success("Account created successfully!");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },
    //*LOGIN SETUP

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });

            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    //* Chat SETUP

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error("Error logging out");
            console.log("Logout error:", error);
        }
    },

}));