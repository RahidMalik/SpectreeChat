import React, { useRef, useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import { useAuthChat } from '../store/useAuthChat';
import { userAuthStore } from '../store/useAuthstore';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import NoChatHistoryPlaceholder from "../Components/NoChatHistoryPlaceholder";
import MessageInput from './MessageInput';

export default function ChatContainer() {
    const {
        selecteduser,
        getMessagesByUserId,
        messages,
        subscribeToMessages,
        unsubscribeFromMessages,
        isMessageLoading,
        setMessages, // ensure useAuthChat returns setMessages
    } = useAuthChat();


    const { authuser, socket } = userAuthStore();
    const messageEndRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    //  Load messages & subscribe
    useEffect(() => {
        if (selecteduser?._id) {
            getMessagesByUserId(selecteduser._id);
            subscribeToMessages();
        }
        return () => unsubscribeFromMessages();
    }, [selecteduser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

    //  Auto-scroll to latest message
    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    //  Emit "markAsSeen" when opening a chat
    useEffect(() => {
        if (selecteduser && socket) {
            socket.emit("markAsSeen", {
                senderId: selecteduser._id,
                receiverId: authuser._id,
            });
        }
    }, [selecteduser, socket, authuser]);

    //  Listen for "messagesSeen" event (real-time seen update)
    useEffect(() => {
        if (!socket) return;

        const handleMessagesSeen = ({ receiverId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.receiverId === receiverId ? { ...msg, seen: true } : msg
                )
            );
        };

        socket.on("messageSeen", handleMessagesSeen);
        return () => socket.off("messageSeen", handleMessagesSeen);
    }, [socket, setMessages]);

    //  Format time
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
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

            {/*  Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 bg-slate-900/50 backdrop-blur-sm">
                {messages.length > 0 && !isMessageLoading ? (
                    <div className="space-y-3">
                        {messages.map((msg) => {
                            const isSent = msg.senderId === authuser._id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] md:max-w-xs rounded-2xl shadow-md border border-slate-700/50 ${isSent
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                            }`}
                                    >
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Shared content"
                                                onClick={() => setPreviewImage(msg.image)}
                                                className="rounded-t-2xl w-full object-cover cursor-pointer hover:opacity-90"
                                                style={{ maxHeight: '250px' }}
                                            />
                                        )}
                                        {msg.text && (
                                            <p className="px-3 py-2 text-sm break-words">
                                                {msg.text}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center px-3 pb-2 text-xs opacity-75">
                                            <span>{formatMessageTime(msg.createdAt)}</span>
                                            {isSent && (
                                                <span className={msg.seen ? "text-cyan-300" : "text-slate-400"}>
                                                    {msg.seen ? "✔✔ Seen" : "✔ Sent"}
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

            <MessageInput />

            {/*  Fullscreen Image Preview */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                    />
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 cursor-pointer text-white text-3xl font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}
