import React, { useRef, useEffect } from 'react';
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
    } = useAuthChat();

    const { authuser } = userAuthStore();
    const messageEndRef = useRef(null);

    //  Load messages & subscribe to socket updates
    useEffect(() => {
        if (selecteduser?._id) {
            getMessagesByUserId(selecteduser._id);
            subscribeToMessages();
        }

        return () => unsubscribeFromMessages();
    }, [selecteduser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);


    // Auto-scroll to latest message
    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Format time for messages
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return "";
            return date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            console.error("Time format error:", error);
            return "";
        }
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
            {/* Original ChatHeader */}
            <ChatHeader />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8">
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
                                        className={`max-w-[85%] md:max-w-xs rounded-lg shadow ${isSent
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                            }`}
                                    >
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Shared content"
                                                className="rounded-t-lg w-full object-cover"
                                                style={{ maxHeight: '250px' }}
                                            />
                                        )}
                                        {msg.text && (
                                            <p className="px-3 py-2 text-sm break-words">
                                                {msg.text}
                                            </p>
                                        )}
                                        {msg.createdAt && formatMessageTime(msg.createdAt) && (
                                            <p className="text-xs px-3 pb-2 opacity-75 text-right">
                                                {formatMessageTime(msg.createdAt)}
                                            </p>
                                        )}
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
        </>
    );
}