import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthChat = create((set, get) => ({

    allContacts: [],
    chats: [],
    messages: [],
    activetab: "chats",
    selectedUser: null,
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

    getMyChatPartners: async () => {
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


}))