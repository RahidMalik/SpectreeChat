import React from 'react'
import { useAuthChat } from "../store/useAuthChat"
import { BorderAnimatedContainer } from '../Components/BorderAnimatedContainer'
import ProfileHeader from '../Components/ProfileHeader'
import ActiveTabSwtich from '../Components/ActiveTabSwtich'
import ChatList from '../Components/ChatList'
import ContactList from '../Components/ContactList'
import NoConversationPlaceholder from "../Components/NoConversationPlaceholder"

function ChatPage() {
    const { activeTab, selecteduser } = useAuthChat();
    return (
        <div className='relative w-full max-w-6xl h-[800px]'>

            <BorderAnimatedContainer>
                {/* left side*/}
                <div className='w-80 bg-slate-800/50 backdrop-blur-sm flex felx-col'>
                    <ProfileHeader />
                    < ActiveTabSwtich />

                    <div className=' flex-1 overflow-y-auto p-4 space-y-2 '>
                        {activeTab === "chats" ? <ChatList /> : <ContactList />}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
                    {selecteduser ? <ChatContainer /> : <NoConversationPlaceholder />}
                </div>
            </BorderAnimatedContainer>
        </div>
    )
}
export default ChatPage
