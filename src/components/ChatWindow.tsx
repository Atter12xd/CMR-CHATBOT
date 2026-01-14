import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, UserCircle } from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { formatTime } from '../data/mockData';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `m${Date.now()}`,
      text: newMessage,
      sender: 'agent',
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageSender = (sender: Message['sender']) => {
    switch (sender) {
      case 'bot':
        return { icon: Bot, bgColor: 'bg-purple-500', name: 'Bot' };
      case 'agent':
        return { icon: UserCircle, bgColor: 'bg-primary-500', name: 'Tú' };
      case 'user':
        return { icon: User, bgColor: 'bg-gray-500', name: chat.customerName };
      default:
        return { icon: User, bgColor: 'bg-gray-500', name: 'Usuario' };
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <img
            src={chat.customerAvatar}
            alt={chat.customerName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{chat.customerName}</h2>
            <p className="text-sm text-gray-500">{chat.customerEmail}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {chat.botActive && (
            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              Bot activo
            </span>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const senderInfo = getMessageSender(message.sender);
          const SenderIcon = senderInfo.icon;
          const isOwnMessage = message.sender === 'agent';

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-[75%]`}>
                {/* Avatar/Icon */}
                <div
                  className={`${senderInfo.bgColor} text-white rounded-full p-2 flex-shrink-0`}
                >
                  <SenderIcon size={16} />
                </div>

                {/* Mensaje */}
                <div className={`${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary-500 text-white'
                        : message.sender === 'bot'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Adjunto"
                        className="mt-2 rounded-lg max-w-xs"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {isOwnMessage && (
                      <span className="text-xs text-gray-500">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {chat.botTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500 text-white rounded-full p-2">
                <Bot size={16} />
              </div>
              <div className="bg-purple-100 text-purple-900 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
