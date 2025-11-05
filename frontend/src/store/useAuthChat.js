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
    isSoundEnable: false,
    isTyping: false,
    typingUserId: null,

    setMessages: (updater) =>
        set((state) => ({
            messages: typeof updater === "function" ? updater(state.messages) : updater,
        })),

    toggleSound: () => set({ isSoundEnable: !get().isSoundEnable }),
    setActiveTab: (tab) => set({ activetab: tab }),
    setSelectedUser: (selecteduser) => set({ selecteduser }),

    // ✅ Get all contacts
    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load contacts");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // ✅ Get chat partners
    getChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load chats");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // ✅ Get messages
    getMessagesByUserId: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessageLoading: false });
        }
    },

    // ✅ Send message (with optimistic UI)
    sendMessage: async (messageData) => {
        const { selecteduser, messages } = get();
        const { authuser } = userAuthStore.getState();

        if (!selecteduser) {
            toast.error("No user selected");
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            senderId: authuser._id,
            receiverId: selecteduser._id,
            text: messageData.text || "",
            image: messageData.image || "",
            createdAt: new Date().toISOString(),
            seen: false,
            isOptimistic: true,
        };

        set({ messages: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selecteduser._id}`, messageData);
            const realMessage = res.data.data || res.data;
            set({
                messages: messages.filter((m) => m._id !== tempId).concat(realMessage),
            });
        } catch (error) {
            console.error("Send message error:", error);
            set({ messages: messages.filter((m) => m._id !== tempId) });
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    // ✅ Typing event
    sendTypingStatus: (receiverId, isTyping) => {
        const socket = userAuthStore.getState().socket;
        if (!socket || !receiverId) return;

        socket.emit(isTyping ? "typing" : "stopTyping", { receiverId });
    },

    // ✅ Delete Message
    // ✅ Delete Message (socket-only)
    deleteMessage: async (messageId, receiverId) => {
        try {
            const socket = userAuthStore.getState().socket;
            const { messages } = get();

            if (socket) {
                socket.emit("deleteMessage", {
                    messageId,
                    senderId: userAuthStore.getState().authuser._id,
                    receiverId,
                });
            }

            // Frontend se bhi remove kar do (instant UI update)
            set({
                messages: messages.filter((msg) => msg._id !== messageId),
            });

            toast.success("Message deleted");
        } catch (error) {
            console.error("Delete message error:", error);
            toast.error("Failed to delete message");
        }
    },

    // ✅ Subscribe to socket events
    subscribeToMessages: () => {
        const socket = userAuthStore.getState().socket;
        const { selecteduser } = get();
        const { authuser } = userAuthStore.getState();

        if (!socket || !selecteduser) return;

        // Cleanup previous listeners
        if (get()._cleanup) get()._cleanup();

        // ✅ New message
        const handleNewMessage = (newMessage) => {
            set((state) => ({ messages: [...state.messages, newMessage] }));
            if (get().isSoundEnable && newMessage.senderId !== authuser._id) {
                const sound = new Audio("/sounds/notification.mp3");
                sound.play().catch(() => { });
            }
        };

        // ✅ Seen Fix
        const handleMessageSeen = ({ receiverId }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.senderId === authuser._id && msg.receiverId === receiverId
                        ? { ...msg, seen: true }
                        : msg
                ),
            }));
        };

        // ✅ Deleted
        const deleteMessage = ({ messageId }) => {
            set((state) => ({
                messages: state.messages.filter((msg) => msg._id !== messageId),
            }));
        };

        // ✅ Typing
        const handleTyping = ({ senderId }) => {
            if (senderId === selecteduser._id) {
                set({ isTyping: true, typingUserId: senderId });
            }
        };

        // ✅ Stop typing
        const handleStopTyping = ({ senderId }) => {
            if (senderId === selecteduser._id) {
                set({ isTyping: false, typingUserId: null });
            }
        };

        // 🧩 Register all socket events
        socket.on("newMessage", handleNewMessage);
        socket.on("messageSeen", handleMessageSeen);
        socket.on("messageDeleted", deleteMessage);
        socket.on("userTyping", handleTyping);
        socket.on("userStopTyping", handleStopTyping);

        // 🧩 Cleanup
        get()._cleanup = () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageSeen", handleMessageSeen);
            socket.off("messageDeleted", deleteMessage);
            socket.off("userTyping", handleTyping);
            socket.off("userStopTyping", handleStopTyping);
        };
    },

    unsubscribeFromMessages: () => {
        const cleanup = get()._cleanup;
        if (cleanup) cleanup();
    },
}));
