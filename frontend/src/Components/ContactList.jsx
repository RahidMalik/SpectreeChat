import { useEffect } from "react";
import { useAuthChat } from "../store/useAuthChat";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { userAuthStore } from "../store/useAuthstore";

function ContactList() {
    const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useAuthChat();
    const { onlineUsers } = userAuthStore();

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    if (isUsersLoading) return <UsersLoadingSkeleton />;

    return (
        <>
            {allContacts.map((contact) => (
                <div
                    key={contact._id}
                    className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
                    onClick={() => setSelectedUser(contact)}
                >
                    <div className="flex items-center gap-3">
                        {/* Avatar with rounded-full */}
                        <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                            <div className="size-12 rounded-full overflow-hidden">
                                <img
                                    src={contact.profilepic || "/avatar.png"}
                                    alt={contact.fullname}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                            <h4 className="text-slate-200 font-medium text-base truncate">
                                {contact.fullname}
                            </h4>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default ContactList;