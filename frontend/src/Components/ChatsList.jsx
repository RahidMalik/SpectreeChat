import React, { useEffect } from 'react';
import { useAuthChat } from '../store/useAuthChat';
import { userAuthStore } from "../store/useAuthstore";
import NoChatsFound from './NoChatsFound';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';

function ChatsList() {
    const { getChatPartners, chats, isUsersLoading, setSelectedUser } = useAuthChat();
    const { onlineUsers } = userAuthStore();

    useEffect(() => {
        getChatPartners();
    }, [getChatPartners]);

    // Optional: Debug


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
                                    src={chat.profilepic || "/avatar.png"}
                                    alt={chat.fullname}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <h4 className="text-slate-200 font-medium truncate">
                            {chat.fullname}
                        </h4>
                    </div>
                </div>

            ))}
        </>
    );
}

export default ChatsList;