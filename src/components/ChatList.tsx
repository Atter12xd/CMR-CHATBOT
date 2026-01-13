import { useState, useEffect } from 'react';
import { mockChats } from '../data/mockData';
import type { Chat } from '../data/mockData';
import { formatTime } from '../data/mockData';
import { MessageSquare } from 'lucide-react';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ selectedChatId, onSelectChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Actualizar chats periódicamente
    const interval = setInterval(() => {
      setChats(mockChats);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <h2 className="text-lg font-semibold text-[#0F172A] mb-3">Conversaciones</h2>
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p>No se encontraron conversaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-primary/10 border-l-4 border-primary'
                    : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={chat.customerAvatar}
                    alt={chat.customerName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#0F172A] truncate text-sm">
                        {chat.customerName}
                      </h3>
                      <span className="text-xs text-[#64748B] flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
