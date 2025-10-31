import React, { useEffect } from 'react';
import { useAuthChat } from '../store/useAuthChat';
import { userAuthStore } from "../store/useAuthstore";
import NoChatsFound from './NoChatsFound';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';

function ChatsList() {
    const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useAuthChat();
    const { onlineUsers } = userAuthStore();

    useEffect(() => {
        getMyChatPartners();
    }, [getMyChatPartners]);

    // Optional: Debug
    console.log("Loading:", isUsersLoading, "Chats:", chats.length);

    if (isUsersLoading) return <UsersLoadingSkeleton />;
    if (chats.length === 0) return <NoChatsFound />;

    return (
        <>
            {chats.map((chat) => (
                <div
                    key={chat._id}
                    className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
                    onClick={() => setSelectedUser(chat)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                            <div className="size-12 rounded-full overflow-hidden">
                                <img
                                    src={chat.profilePic || "/avatar.png"}
                                    alt={chat.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <h4 className="text-slate-200 font-medium truncate">
                            {chat.fullName}
                        </h4>
                    </div>
                </div>
            ))}
        </>
    );
}

export default ChatsList;