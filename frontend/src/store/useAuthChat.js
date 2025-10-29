import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthChat = create((set, get) => ({
    allContacts: [],
    chat: [],
    messages: [],
    activetab: "chats",
    SelectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,
    isSoundEnable: localStorage.getItem("isSoundEnabled") === true,




    toggleSound: () => {
        localStorage.getItem("isSoundEnabled", !get().isSoundEnable)
        set({ isSoundEnable: !get().isSoundEnable })
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

    getMyChatPartner: async () => {
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