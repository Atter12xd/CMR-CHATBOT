import { useState, useEffect } from 'react';
import { mockChats, formatTime } from '../data/mockData';
import type { Chat, Message } from '../data/mockData';
import { Send, Bot, User } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  onBack?: () => void;
}

export default function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const foundChat = mockChats.find((c) => c.id === chatId);
    setChat(foundChat || null);
  }, [chatId]);

  useEffect(() => {
    // Actualizar chat periódicamente
    const interval = setInterval(() => {
      const foundChat = mockChats.find((c) => c.id === chatId);
      setChat(foundChat || null);
    }, 2000);

    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat) return;

    // Aquí se enviaría el mensaje
    console.log('Enviar mensaje:', newMessage);
    setNewMessage('');
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8FAFC] text-[#64748B]">
        <p>Chat no encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex items-center gap-2 sm:gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 hover:bg-[#F8FAFC] rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <img
          src={chat.customerAvatar}
          alt={chat.customerName}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] truncate text-sm sm:text-base">{chat.customerName}</h3>
          <p className="text-xs sm:text-sm text-[#64748B] truncate">{chat.customerEmail}</p>
        </div>
        {chat.botActive && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0">
            <Bot size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span className="hidden sm:inline">Bot Activo</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#ECE5DD]">
        {chat.messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#DCF8C6] text-[#0F172A]'
                  : message.sender === 'bot'
                  ? 'bg-[#E0D0F0] text-[#0F172A]'
                  : 'bg-white text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                {message.sender === 'bot' && <Bot size={12} className="sm:w-[14px] sm:h-[14px]" />}
                {message.sender === 'agent' && <User size={12} className="sm:w-[14px] sm:h-[14px]" />}
              </div>
              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.text}</p>
              <p className="text-[10px] sm:text-xs text-[#64748B] mt-1 text-right">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 sm:px-4 py-2 border border-[#E2E8F0] rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 sm:px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex-shrink-0"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
