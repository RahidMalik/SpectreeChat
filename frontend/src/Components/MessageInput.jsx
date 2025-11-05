import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useAuthChat } from "../store/useAuthChat";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
    const { playRandomKeyStrokeSound } = useKeyboardSound();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { sendMessage, isSoundEnable, selecteduser, sendTypingStatus } = useAuthChat();

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        if (isSoundEnable) playRandomKeyStrokeSound();

        sendMessage({
            text: text.trim(),
            image: imagePreview,
        });

        setText("");
        setImagePreview(null);
        sendTypingStatus(selecteduser?._id, false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        clearTimeout(typingTimeoutRef.current);
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setText(value);

        if (!selecteduser) return;

        sendTypingStatus(selecteduser._id, value.trim().length > 0);

        if (isSoundEnable) playRandomKeyStrokeSound();

        clearTimeout(typingTimeoutRef.current);
        if (value.trim().length > 0) {
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStatus(selecteduser._id, false);
            }, 2000);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            return toast.error("Please select an image file");
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Image must be less than 5MB");
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-3 sm:p-4 border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
            {imagePreview && (
                <div className="max-w-3xl mx-auto mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                            onClick={() => setImagePreview(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 transition-colors"
                            type="button"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-slate-400 text-sm">Image selected</p>
                </div>
            )}

            <form
                onSubmit={handleSendMessage}
                className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3"
            >
                <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    onBlur={() => sendTypingStatus(selecteduser?._id, false)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 text-white rounded-lg py-2 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 sm:px-3 sm:py-2 rounded-lg transition-colors ${imagePreview
                        ? "text-cyan-500 bg-slate-800/60"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <button
                    type="submit"
                    disabled={!text.trim() && !imagePreview}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg p-2 sm:px-4 sm:py-2 hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}

export default MessageInput;
