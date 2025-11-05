import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { userAuthStore } from "./useAuthstore";

/**
 * useAuthChat: messages are owned here (messages: []).
 * This store will read socket from userAuthStore.getState().socket
 * and register message-related handlers (newMessage, messageSeen).
 */

export const useAuthChat = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [], // default
    activetab: "chats",
    selecteduser: null,
    isUsersLoading: false,
    isMessageLoading: false,
    isSoundEnable: false,

    // safe setter for messages: accepts update function
    setMessages: (updateFn) =>
        set((state) => ({
            messages: updateFn(state.messages || []),
        })),

    toggleSound: () => {
        set({ isSoundEnable: !get().isSoundEnable });
    },

    setActiveTab: (tab) => set({ activetab: tab }),
    setSelectedUser: (selecteduser) => set({ selecteduser }),

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

    getMessagesByUserId: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            // ensure messages always an array and include seen flag default
            const msgs = Array.isArray(res.data)
                ? res.data.map((m) => ({ ...m, seen: !!m.seen }))
                : [];
            set({ messages: msgs });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessageLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selecteduser } = get();
        const { authuser, socket } = userAuthStore.getState();

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

        // Use functional set to avoid stale state
        set((state) => ({ messages: [...(state.messages || []), optimisticMessage] }));

        try {
            const res = await axiosInstance.post(`/messages/send/${selecteduser._id}`, messageData);
            const realMessage = res.data.data || res.data;

            // replace optimistic with real (functional update)
            set((state) => ({
                messages: (state.messages || []).filter((m) => m._id !== tempId).concat(realMessage),
            }));

            // emit socket newMessage so receiver gets it in real-time (optional if backend emits)
            if (socket && socket.connected) {
                socket.emit("newMessage", realMessage);
            }
        } catch (error) {
            console.error("Send message error:", error);
            // remove optimistic
            set((state) => ({ messages: (state.messages || []).filter((m) => m._id !== tempId) }));
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const socket = userAuthStore.getState().socket;
        const { selecteduser } = get();
        const { authuser } = userAuthStore.getState();

        if (!socket || !selecteduser) return;

        // avoid registering multiple times: if _cleanup exists, call it first
        if (get()._cleanup) {
            get()._cleanup();
        }

        // New message handler
        const handleNewMessage = (newMessage) => {
            // only add if newMessage belongs to this open chat (A <-> B)
            const belongsToChat =
                (String(newMessage.senderId) === String(selecteduser._id) &&
                    String(newMessage.receiverId) === String(authuser._id)) ||
                (String(newMessage.senderId) === String(authuser._id) &&
                    String(newMessage.receiverId) === String(selecteduser._id));

            if (!belongsToChat) return;

            set((state) => ({ messages: [...(state.messages || []), newMessage] }));

            // auto-mark seen when receiver is current authuser and chat open
            if (String(newMessage.receiverId) === String(authuser._id)) {
                // emit markAsSeen for messages from selecteduser -> authuser
                socket.emit("markAsSeen", {
                    senderId: newMessage.senderId,
                    receiverId: authuser._id,
                });
            }

            // play notification sound for incoming messages (not for own messages)
            if (get().isSoundEnable && String(newMessage.senderId) !== String(authuser._id)) {
                const sound = new Audio("/sounds/notification.mp3");
                sound.currentTime = 0;
                sound.play().catch(() => { });
            }
        };

        // Message seen handler
        const handleMessageSeen = ({ receiverId, senderId }) => {
            // receiverId: the one who saw messages (i.e. current receiver)
            // senderId: the original sender whose messages were seen
            set((state) => ({
                messages: (state.messages || []).map((msg) => {
                    // mark only messages that were sent by senderId to receiverId
                    if (
                        String(msg.senderId) === String(senderId) &&
                        String(msg.receiverId) === String(receiverId)
                    ) {
                        return { ...msg, seen: true };
                    }
                    return msg;
                }),
            }));
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageSeen", handleMessageSeen);

        // Save cleanup
        get()._cleanup = () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageSeen", handleMessageSeen);
            delete get()._cleanup;
        };
    },

    unsubscribeFromMessages: () => {
        const cleanup = get()._cleanup;
        if (cleanup) cleanup();
    },
}));
