import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { Chat } from '../data/mockData';
import { mockChats } from '../data/mockData';

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChatId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
        <p className="text-gray-600 mt-2">Gestiona tus conversaciones con clientes</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Lista de chats - visible en desktop siempre, toggle en móvil */}
        <div
          className={`${
            showChatList ? 'block' : 'hidden'
          } md:block w-full md:w-80 lg:w-96 flex-shrink-0`}
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Ventana de chat */}
        <div
          className={`${
            !showChatList && selectedChat ? 'block' : 'hidden'
          } ${selectedChat ? 'md:block' : 'md:hidden'} flex-1 min-w-0`}
        >
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={handleBackToList}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Selecciona un chat para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
