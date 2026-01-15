import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import type { Chat } from '../data/mockData';
import { formatTime } from '../data/mockData';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlatformIcon = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">f</div>;
      case 'whatsapp':
        return <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>;
      case 'web':
        return <MessageCircle size={16} className="text-gray-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Búsqueda */}
      <div className="p-3 border-b border-gray-200 bg-[#f0f2f5]">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar o empezar un chat nuevo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-0 rounded-lg focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
          />
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron conversaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full px-3 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                  selectedChatId === chat.id ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.customerAvatar}
                      alt={chat.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor(chat.status)} rounded-full border-2 border-white`} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium text-gray-900 truncate text-[15px]">
                        {chat.customerName}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mb-1">
                      {getPlatformIcon(chat.platform)}
                      <p className="text-sm text-gray-600 truncate flex-1 leading-tight">
                        {chat.lastMessage}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {chat.botActive && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            Bot activo
                          </span>
                        )}
                        {chat.status === 'waiting' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            Esperando
                          </span>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
