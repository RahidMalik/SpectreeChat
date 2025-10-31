import { useAuthChat } from "../store/useAuthChat";

function ActiveTabSwitch() {
    const { activetab, setActiveTab } = useAuthChat();

    return (
        <div className="w-full flex justify-center mt-3">
            <div className="flex gap-4 px-5 py-3 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-md">

                {/* Chats Tab */}
                <button
                    onClick={() => setActiveTab("chats")}
                    className={`px-6 py-2 rounded-xl text-sm sm:text-base font-medium border-2 transition-all duration-200 
        ${activetab === "chats"
                            ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                            : "border-slate-700 text-slate-400"
                        }`}
                >
                    Chats
                </button>

                {/* Contacts Tab */}
                <button
                    onClick={() => setActiveTab("contacts")}
                    className={`px-6 py-2 rounded-xl text-sm sm:text-base font-medium border-2 transition-all duration-200
       ${activetab === "contacts"
                            ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                            : "border-slate-700 text-slate-400"
                        }`}
                >
                    Contacts
                </button>
            </div>
        </div>
    );
}

export default ActiveTabSwitch;
