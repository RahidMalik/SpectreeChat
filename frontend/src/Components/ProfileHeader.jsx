import { useState, useRef, useEffect } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthChat } from "../store/useAuthChat";
import { userAuthStore } from "../store/useAuthstore";
import { useNavigate } from "react-router-dom";
import React from "react";
import toast from "react-hot-toast";

export default function ProfileHeader() {
    const mouseClickSound = useRef(new Audio("/sounds/mouse-click.mp3"));
    const { logout, authuser, updateProfile } = userAuthStore();
    const navigate = useNavigate();
    const { isSoundEnabled, toggleSound } = useAuthChat();
    const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
    const [selectedImg, setSelectedImg] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setSoundEnabled(isSoundEnabled);
    }, [isSoundEnabled]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            try {
                await updateProfile({ profilepic: base64Image });
            } catch (error) {
                setSelectedImg(authuser?.profilepic || null);
                toast.error("Failed to update profile picture", error);
            }
        };
        reader.onerror = () => {
            toast.error("Failed to read image file");
        };
    };

    useEffect(() => {
        if (authuser?.profilepic) {
            setSelectedImg(authuser.profilepic);
        }
    }, [authuser?.profilepic]);

    return (
        <div className="p-6 border-b border-slate-700/50 w-full">
            <div className="flex justify-between items-center w-full">
                {/* LEFT SIDE: Avatar + Name */}
                <div className="flex items-center gap-3">
                    <div className="avatar online">
                        <button
                            className="size-14 rounded-full overflow-hidden relative group"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <img
                                src={selectedImg || authuser?.profilepic || "/avatar.png"}
                                alt="User"
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-xs">Change</span>
                            </div>
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
                            {authuser?.fullname}
                        </h3>
                        <p className="text-slate-400 text-xs">Online</p>
                    </div>
                </div>

                {/* RIGHT SIDE: Buttons */}
                <div className="flex gap-4 items-center justify-between">
                    <button
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => logout(navigate)}
                    >
                        <LogOutIcon className="size-5" />
                    </button>

                    <button
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => {
                            mouseClickSound.currentTime = 0;
                            mouseClickSound.current
                                .play()
                                .catch((err) => console.log("Audio play failed:", err));
                            toggleSound();
                            setSoundEnabled(!soundEnabled);
                        }}
                    >
                        {soundEnabled ? (
                            <Volume2Icon className="size-5" />
                        ) : (
                            <VolumeOffIcon className="size-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
