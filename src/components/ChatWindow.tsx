import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, UserCircle, Loader2, Check, CheckCheck } from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { loadChatWithMessages, subscribeToChatMessages } from '../services/chats';
import { sendTextMessage, markMessagesAsRead } from '../services/whatsapp-messages';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(chat.messages || []);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar mensajes cuando se abre el chat
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const fullChat = await loadChatWithMessages(chat.id);
        if (fullChat) {
          setMessages(fullChat.messages);
          // Marcar mensajes como leídos
          await markMessagesAsRead(chat.id);
        }
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Suscribirse a nuevos mensajes en tiempo real
    const unsubscribe = subscribeToChatMessages(chat.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [chat.id]);

  useEffect(() => {
    // Scroll solo si estamos cerca del final o es un mensaje nuevo
    const scrollContainer = messagesEndRef.current?.parentElement;
    if (scrollContainer) {
      const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop < scrollContainer.clientHeight + 200;
      if (isNearBottom || messages.length === 0) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } else {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update: agregar mensaje inmediatamente
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: 'agent',
      timestamp: new Date(),
      read: false,
    };
    setMessages([...messages, optimisticMessage]);

    try {
      // Enviar mensaje a WhatsApp
      const result = await sendTextMessage({
        chatId: chat.id,
        text: messageText,
      });

      if (result.success && result.messageId) {
        // Recargar mensajes para obtener el mensaje real con ID
        const fullChat = await loadChatWithMessages(chat.id);
        if (fullChat) {
          setMessages(fullChat.messages);
        }
      } else {
        // Si falló, remover el mensaje optimista y mostrar error
        setMessages(messages);
        alert(result.error || 'Error al enviar mensaje');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      // Remover mensaje optimista
      setMessages(messages);
      alert('Error al enviar mensaje: ' + (error.message || 'Error desconocido'));
    } finally {
      setSending(false);
    }
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
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-[#f0f2f5] flex items-center justify-between">
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
            className="w-11 h-11 rounded-full border-2 border-gray-200"
          />
          <div>
            <h2 className="font-semibold text-gray-900 text-base">{chat.customerName}</h2>
            <p className="text-xs text-gray-500">
              {chat.platform === 'whatsapp' && 'WhatsApp'}
              {chat.platform === 'facebook' && 'Facebook'}
              {chat.platform === 'web' && 'Web'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {chat.botActive && (
            <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              Bot activo
            </span>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-1 bg-[#efeae2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbD0iI2VmZWFlMiIvPjxwYXRoIGQ9Ik0yNi4yNSAyNi4yNWg0Ny41djQ3LjVoLTQ3LjV6IiBmaWxsPSIjZjVmNWY1IiBmaWxsLW9wYWNpdHk9Ii41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
          const senderInfo = getMessageSender(message.sender);
          const SenderIcon = senderInfo.icon;
          const isOwnMessage = message.sender === 'agent';
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !prevMessage || prevMessage.sender !== message.sender || 
            (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 300000; // 5 minutos

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[85%] md:max-w-[65%]`}>
                {/* Avatar/Icon - solo mostrar si es necesario */}
                {showAvatar && (
                  <div
                    className={`${senderInfo.bgColor} text-white rounded-full p-2 flex-shrink-0 w-8 h-8 items-center justify-center hidden sm:flex ${isOwnMessage ? 'ml-2' : 'mr-2'}`}
                  >
                    <SenderIcon size={14} />
                  </div>
                )}
                {!showAvatar && <div className="w-8 flex-shrink-0 hidden sm:block" />}

                {/* Mensaje */}
                <div className={`${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-lg px-3 py-2 shadow-sm ${
                      isOwnMessage
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-br-sm'
                        : message.sender === 'bot'
                        ? 'bg-purple-100 text-purple-900 rounded-bl-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Adjunto"
                        className="mt-2 rounded-lg max-w-xs"
                      />
                    )}
                  </div>
                  <div className={`flex items-center space-x-1.5 mt-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-gray-400">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {isOwnMessage && (
                      <span className="text-xs text-gray-400">
                        {message.read ? (
                          <CheckCheck size={12} className="text-blue-500" />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          </>
        )}
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
      <div className="px-3 md:px-6 py-3 border-t border-gray-200 bg-[#f0f2f5]">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative bg-white rounded-3xl border border-gray-300 flex items-center">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full resize-none rounded-3xl px-4 py-2.5 pr-12 focus:outline-none bg-transparent text-sm text-gray-900 placeholder-gray-500"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
