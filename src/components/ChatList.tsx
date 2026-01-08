import type { Chat } from '../data/mockData';
import { formatTime } from '../data/mockData';
import { MessageSquare, Clock, CheckCircle2, Bot } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const getStatusIcon = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'waiting':
        return <Clock size={16} className="text-yellow-500" />;
      case 'resolved':
        return <CheckCircle2 size={16} className="text-gray-400" />;
    }
  };

  const getPlatformColor = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-100 text-blue-700';
      case 'whatsapp':
        return 'bg-green-100 text-green-700';
      case 'web':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg lg:rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 lg:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="text-lg lg:text-lg font-semibold text-gray-900">Conversaciones</h2>
        <p className="text-sm text-gray-500 mt-1">{chats.length} conversaciones activas</p>
      </div>
      <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full p-3 lg:p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${
              selectedChatId === chat.id ? 'bg-primary-50 lg:border-l-4 border-primary-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <img
                src={chat.customerAvatar}
                alt={chat.customerName}
                className="w-12 h-12 lg:w-12 lg:h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">{chat.customerName}</h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${getPlatformColor(chat.platform)}`}>
                    {chat.platform}
                  </span>
                  {getStatusIcon(chat.status)}
                  {chat.botActive && (
                    <span className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      <Bot size={12} />
                      <span className="hidden sm:inline">Bot</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center ml-2 w-5 h-5 lg:w-6 lg:h-6 bg-primary-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

