import React, { useState } from 'react';
import { Send, Search, MoreVertical } from 'lucide-react';
import { IoMdArrowRoundBack } from "react-icons/io";

export default function ChatApp() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');

  // Dummy users data
  const users = [
    { id: 1, name: 'Alice Johnson', lastMessage: 'Hey! How are you?', time: '2m ago', unread: 2, online: true },
    { id: 2, name: 'Bob Smith', lastMessage: 'Let\'s meet tomorrow', time: '1h ago', unread: 0, online: true },
    { id: 3, name: 'Carol Williams', lastMessage: 'Thanks for the help!', time: '3h ago', unread: 1, online: false },
    { id: 4, name: 'David Brown', lastMessage: 'See you soon', time: '1d ago', unread: 0, online: false },
    { id: 5, name: 'Emma Davis', lastMessage: 'Perfect!', time: '2d ago', unread: 0, online: true },
  ];

  // Dummy messages

  const dummyMessages = [
    { id: 1, text: 'Hey! How are you doing?', sender: 'other', time: '10:30 AM' },
    { id: 2, text: 'I\'m doing great! Thanks for asking.', sender: 'me', time: '10:32 AM' },
    { id: 3, text: 'That\'s awesome! I wanted to ask you about the project.', sender: 'other', time: '10:33 AM' },
    { id: 4, text: 'Sure, what would you like to know?', sender: 'me', time: '10:35 AM' },
    { id: 5, text: 'When do you think we can schedule a meeting to discuss the details?', sender: 'other', time: '10:36 AM' },
    { id: 6, text: 'How about tomorrow at 3 PM?', sender: 'me', time: '10:38 AM' },
    { id: 7, text: 'Perfect! That works for me.', sender: 'other', time: '10:39 AM' },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`w-full md:w-100 bg-white border-r border-gray-200 flex flex-col transition-all duration-700 
          ${selectedUser ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Sidebar Header */}

        <div className="logo p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">SpectreeChat</h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    {user.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{user.name}</h3>
                      <span className="text-xs text-gray-500">{user.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                  </div>
                </div>
                {user.unread > 0 && (
                  <div className="ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">{user.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}

      <div className={`flex-1 flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}

            <div className="bg-white border-b border-gray-200 pl-2 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center">

                {/* Back button for mobile */}

                <button
                  className="md:hidden p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setSelectedUser(null)}
                >
                  <IoMdArrowRoundBack size={25}/>
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-500">{selectedUser.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {dummyMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'me'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                  >
                    <p className="break-words">{msg.text}</p>
                    <span
                      className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    rows="1"
                    className="w-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-500"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Chat</h2>
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
