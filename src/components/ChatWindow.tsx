import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, UserCircle, Loader2, Paperclip } from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { loadChatWithMessages, subscribeToChatMessages } from '../services/chats';
import { sendTextMessage, sendImageMessage, sendDocumentMessage, markMessagesAsRead } from '../services/whatsapp-messages';
import MessageStatusIndicator from './MessageStatusIndicator';
import FileUploadModal from './FileUploadModal';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
  whatsAppNumber?: string;
  onRefetchChats?: () => void | Promise<void>;
}

export default function ChatWindow({ chat, onBack, whatsAppNumber, onRefetchChats }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(chat.messages || []);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
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
      status: 'sending',
    };
    setMessages([...messages, optimisticMessage]);

    try {
      // Enviar mensaje a WhatsApp
      const result = await sendTextMessage({
        chatId: chat.id,
        text: messageText,
      });

      if (result.success && result.messageId) {
        const fullChat = await loadChatWithMessages(chat.id);
        if (fullChat) setMessages(fullChat.messages);
        onRefetchChats?.();
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

  const handleSendFile = async (fileUrl: string, fileType: 'image' | 'document', caption?: string) => {
    try {
      setSending(true);

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        text: caption || (fileType === 'image' ? '📷 Imagen' : '📄 Documento'),
        sender: 'agent',
        timestamp: new Date(),
        status: 'sending',
        image: fileType === 'image' ? fileUrl : undefined,
      };
      setMessages([...messages, optimisticMessage]);

      // Enviar archivo
      if (fileType === 'image') {
        const result = await sendImageMessage({
          chatId: chat.id,
          imageUrl: fileUrl,
          caption,
        });
        
        if (result.success) {
          const fullChat = await loadChatWithMessages(chat.id);
          if (fullChat) setMessages(fullChat.messages);
          onRefetchChats?.();
        } else {
          setMessages(messages);
          alert(result.error || 'Error al enviar imagen');
        }
      } else {
        const filename = fileUrl.split('/').pop() || 'documento';
        const result = await sendDocumentMessage({
          chatId: chat.id,
          documentUrl: fileUrl,
          filename,
        });

        if (result.success) {
          const fullChat = await loadChatWithMessages(chat.id);
          if (fullChat) setMessages(fullChat.messages);
          onRefetchChats?.();
        } else {
          setMessages(messages);
          alert(result.error || 'Error al enviar documento');
        }
      }
    } catch (error: any) {
      console.error('Error enviando archivo:', error);
      setMessages(messages);
      alert('Error al enviar archivo: ' + (error.message || 'Error desconocido'));
    } finally {
      setSending(false);
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
    <div className="h-full w-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-4 md:px-6 py-3.5 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <img
            src={chat.customerAvatar}
            alt={chat.customerName}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
          />
          <div>
            <h2 className="font-semibold text-slate-900 text-base tracking-tight">{chat.customerName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {chat.platform === 'whatsapp' && (whatsAppNumber ? `WhatsApp · ${whatsAppNumber}` : 'WhatsApp')}
              {chat.platform === 'facebook' && 'Facebook'}
              {chat.platform === 'web' && 'Web'}
            </p>
          </div>
        </div>
        {chat.botActive && (
          <span className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-medium">
            Bot activo
          </span>
        )}
      </div>

      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-3 bg-[#e8e4dc] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0iI2U4ZTRkYyIvPjxwYXRoIGQ9Ik0xMC41IDEwLjVoMTl2MTloLTE5eiIgZmlsbD0iI2Y1ZjVmNSIgZmlsbC1vcGFjaXR5PSIuNCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const senderInfo = getMessageSender(message.sender);
              const SenderIcon = senderInfo.icon;
              const isOwnMessage = message.sender === 'agent';
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender !== message.sender ||
                (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 300000;

              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[82%] md:max-w-[60%]`}>
                    {showAvatar ? (
                      <div className={`${senderInfo.bgColor} text-white rounded-xl p-2 flex-shrink-0 w-9 h-9 flex items-center justify-center hidden sm:flex shadow-sm`}>
                        <SenderIcon size={16} />
                      </div>
                    ) : (
                      <div className="w-9 flex-shrink-0 hidden sm:block" />
                    )}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOwnMessage
                            ? 'bg-[#dcf8c6] text-slate-900 rounded-br-md'
                            : message.sender === 'bot'
                            ? 'bg-violet-100 text-violet-900 rounded-bl-md'
                            : 'bg-white text-slate-900 rounded-bl-md shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                        {message.image && (
                          <img src={message.image} alt="Adjunto" className="mt-2 rounded-xl max-w-[240px] shadow-sm" />
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] text-slate-400">{formatMessageTime(message.timestamp)}</span>
                        {isOwnMessage && (
                          <MessageStatusIndicator
                            status={message.status || (message.read ? 'read' : 'sent')}
                            className="flex-shrink-0"
                          />
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
            <div className="flex items-end gap-2">
              <div className="bg-violet-500 text-white rounded-xl p-2 w-9 h-9 flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                  <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 border-t border-slate-200 bg-white">
        <div className="flex items-end gap-3">
          <button
            onClick={() => setShowFileModal(true)}
            disabled={sending}
            className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
            title="Adjuntar"
          >
            <Paperclip size={22} />
          </button>
          <div className="flex-1 min-w-0 bg-slate-100 rounded-2xl border border-slate-200/80 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full resize-none rounded-2xl px-4 py-3 bg-transparent focus:outline-none text-[15px] text-slate-900 placeholder-slate-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
          </button>
        </div>
      </div>

      <FileUploadModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSend={handleSendFile}
        chatId={chat.id}
      />
    </div>
  );
}
