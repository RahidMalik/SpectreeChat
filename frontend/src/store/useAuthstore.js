import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Load saved user from localStorage at app start
const storedUser = JSON.parse(localStorage.getItem("authuser"));

export const userAuthStore = create((set) => ({
    authuser: storedUser || null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    onlineUsers: [],

    //* CHECK AUTH 
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authuser: res.data });
            localStorage.setItem("authuser", JSON.stringify(res.data)); // keep synced
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
            set({ authuser: null });
            localStorage.removeItem("authuser");
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            toast.error("Error logging out");
            console.log("Logout error:", error);
        }
    },

    //* UPDATE PROFILE (fixed for localStorage sync)
    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/UpdateProfile", data);

            if (res.data) {
                set({ authuser: res.data });
                localStorage.setItem("authuser", JSON.stringify(res.data)); // update in localStorage too
                console.log(JSON.parse(localStorage.getItem("authuser")));
                toast.success("Profile updated successfully");
            } else {
                toast.error("Failed to get updated user data");
            }

        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    },
}));
