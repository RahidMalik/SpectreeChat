import { XIcon } from "lucide-react";
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

        // cleanup function
        return () => window.removeEventListener("keydown", handleEscKey);
    }, [setSelectedUser]);

    return (
        <div
            className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
        >
            <div className="flex items-center space-x-3">
                <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                    <div className="size-12 rounded-full overflow-hidden ">
                        <img src={selecteduser.profilepic || "/avatar.png"} alt={selecteduser.fullname} className="size-full object-cover" />
                    </div>
                </div>

                <div>
                    <h3 className="text-slate-200 font-medium">{selecteduser.fullname}</h3>
                    <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
                </div>
            </div>

            <button onClick={() => setSelectedUser(null)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    );
}
export default ChatHeader;
