import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { userAuthStore } from "./useAuthstore";

export const useAuthChat = create((set, get) => ({

    allContacts: [],
    chats: [],
    messages: [],
    activetab: "chats",
    selecteduser: null,
    isUsersLoading: false,
    isMessageLoading: false,
    isSoundEnable: localStorage.getItem("isSoundEnabled") === "true",


    toggleSound: () => {
        const newValue = !get().isSoundEnable;
        localStorage.setItem("isSoundEnabled", newValue);
        set({ isSoundEnable: newValue });
    },


    setActiveTab: (tab) => set({ activetab: tab }),
    setSelectedUser: (selecteduser) => set({ selecteduser }),

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({
                allContacts: res.data
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMessagesByUserId: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isMessageLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selecteduser, messages } = get();
        const { authuser } = userAuthStore.getState();

        if (!selecteduser) {
            toast.error("No user selected");
            return;
        }

        const tempId = `temp-${Date.now()}`;

        // Optimistic message for instant UI update
        const optimisticMessage = {
            _id: tempId,
            senderId: authuser._id,
            receiverId: selecteduser._id,
            text: messageData.text || "",
            image: messageData.images || "", // Frontend se "images" field aayegi
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        // Immediately add to UI
        set({ messages: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selecteduser._id}`, messageData);

            // Backend returns: { message: "...", data: newMessage }
            const realMessage = res.data.data;

            console.log("Real message from backend:", realMessage); // Debug

            // Replace optimistic message with real one from backend
            set({
                messages: messages.filter(msg => msg._id !== tempId).concat(realMessage)
            });

        } catch (error) {
            console.error("Send message error:", error);
            // Remove optimistic message on failure
            set({ messages: messages.filter(msg => msg._id !== tempId) });
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },


}))