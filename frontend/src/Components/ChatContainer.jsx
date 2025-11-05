import React, { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import { useAuthChat } from "../store/useAuthChat";
import { userAuthStore } from "../store/useAuthstore";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "../Components/NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import { TiTick, TiTickOutline } from "react-icons/ti";
import { Trash2 } from "lucide-react";

export default function ChatContainer() {
    const {
        selecteduser,
        getMessagesByUserId,
        messages,
        subscribeToMessages,
        unsubscribeFromMessages,
        isMessageLoading,
        isTyping,
        typingUserId,
        setMessages,
        deleteMessage
    } = useAuthChat();

    const { authuser, socket } = userAuthStore();
    const messageEndRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Load messages & subscribe
    useEffect(() => {
        if (selecteduser?._id) {
            getMessagesByUserId(selecteduser._id);
            subscribeToMessages();
        }
        return () => unsubscribeFromMessages();
    }, [selecteduser?._id]);

    // Auto-scroll
    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // ✅ Mark messages as seen when chat opens
    useEffect(() => {
        if (selecteduser && socket && authuser) {
            socket.emit("markAsSeen", {
                senderId: selecteduser._id,
                receiverId: authuser._id,
            });
        }
    }, [selecteduser?._id, socket, authuser?._id]);

    // ✅ Also mark as seen when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && selecteduser && socket && authuser) {
            const unseenMessages = messages.filter(
                msg => msg.senderId === selecteduser._id && !msg.seen
            );

            if (unseenMessages.length > 0) {
                socket.emit("markAsSeen", {
                    senderId: selecteduser._id,
                    receiverId: authuser._id,
                });
            }
        }
    }, [messages.length, selecteduser?._id, socket, authuser?._id]);

    // ✅ Listen for deleted messages from socket
    useEffect(() => {
        if (!socket) return;

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        };

        socket.on("messageDeleted", handleMessageDeleted);

        return () => {
            socket.off("messageDeleted", handleMessageDeleted);
        };
    }, [socket]);

    // Format time
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 🧩 Delete message handler
    const handleDeleteMessage = (messageId) => {
        if (!selecteduser?._id) return;

        socket.emit("deleteMessage", {
            messageId,
            senderId: authuser._id,
            receiverId: selecteduser._id,
        });

        deleteMessage(messageId, selecteduser._id);
    };

    if (!selecteduser) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-400 text-lg">Select a contact to start chatting</p>
            </div>
        );
    }

    return (
        <>
            <ChatHeader />

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8">
                {messages.length > 0 && !isMessageLoading ? (
                    <div className="space-y-3">
                        {messages.map((msg) => {
                            const isSent = msg.senderId === authuser._id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`relative group max-w-[85%] md:max-w-xs rounded-lg shadow ${isSent
                                            ? "bg-cyan-600 text-white"
                                            : "bg-slate-800 text-slate-200"
                                            }`}
                                    >
                                        {/* 🧩 Delete icon (only show for sender) */}
                                        {isSent && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="transition-opacity bg-slate-900/80 p-1 rounded-lg"
                                                title="Delete message"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                                            </button>
                                        )}

                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Shared"
                                                onClick={() => setPreviewImage(msg.image)}
                                                className="rounded-t-lg w-full object-cover cursor-pointer hover:opacity-90"
                                                style={{ maxHeight: "250px" }}
                                            />
                                        )}
                                        {msg.text && (
                                            <p className="px-3 py-2 text-sm break-words">{msg.text}</p>
                                        )}
                                        <div className="flex justify-between items-center px-3 pb-2 text-xs opacity-75">
                                            <span>{formatMessageTime(msg.createdAt)}</span>
                                            {isSent && (
                                                <span
                                                    className={`flex items-center gap-1 ${msg.seen
                                                        ? "text-cyan-300"
                                                        : "text-slate-400"
                                                        }`}
                                                >
                                                    {msg.seen ? (
                                                        <>
                                                            <TiTick /> Seen
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TiTickOutline /> Sent
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messageEndRef} />
                    </div>
                ) : isMessageLoading ? (
                    <MessagesLoadingSkeleton />
                ) : (
                    <NoChatHistoryPlaceholder name={selecteduser.fullname} />
                )}
            </div>

            {/* Typing indicator */}
            {isTyping && typingUserId === selecteduser._id && (
                <div className="flex items-center gap-2 px-6 py-2 text-slate-400 text-sm">
                    <span className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                    </span>
                </div>
            )}

            <MessageInput />

            {/* Image Preview */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-xl"
                    />
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 text-white text-3xl"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}
