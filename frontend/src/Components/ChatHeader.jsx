import { XIcon, ArrowLeftIcon } from "lucide-react";
import { useAuthChat } from "../store/useAuthChat";
import { useEffect } from "react";
import { userAuthStore } from "../store/useAuthstore";

function ChatHeader() {
    const { selecteduser, setSelectedUser } = useAuthChat();
    const { onlineUsers } = userAuthStore();
    const isOnline = onlineUsers.includes(selecteduser._id);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") setSelectedUser(null);
        };
        window.addEventListener("keydown", handleEscKey);
        return () => window.removeEventListener("keydown", handleEscKey);
    }, [setSelectedUser]);

    return (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
            {/* Left section (avatar + name) */}
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Mobile back button */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-slate-300" />
                </button>

                <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                            src={selecteduser.profilepic || "/avatar.png"}
                            alt={selecteduser.fullname}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <h4 className="text-slate-100 font-medium text-sm sm:text-base truncate">
                        {selecteduser.fullname}
                    </h4>
                    <p className="text-xs text-slate-400">{isOnline ? "Online" : "Offline"}</p>
                </div>
            </div>

            {/* Close button (desktop) */}
            <button
                onClick={() => setSelectedUser(null)}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-800 transition-colors"
            >
                <XIcon className="w-5 h-5 text-slate-300" />
            </button>
        </div>
    );
}
export default ChatHeader;
