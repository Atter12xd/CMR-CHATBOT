import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, UserCircle, Loader2, Paperclip, MoreVertical, Pencil, Trash2, Info, X } from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { loadChatWithMessages, subscribeToChatMessages, clearChat, updateChatName } from '../services/chats';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState(chat.customerName);
  const [renaming, setRenaming] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [displayName, setDisplayName] = useState(chat.customerName);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setDisplayName(chat.customerName);
    setRenameValue(chat.customerName);
  }, [chat.id, chat.customerName]);


  useEffect(() => {
    const loadMessages = async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        const fullChat = await loadChatWithMessages(chat.id);
        if (fullChat) {
          setMessages(fullChat.messages);
          await markMessagesAsRead(chat.id);
        }
        onRefetchChats?.();
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      } finally {
        if (showLoader) setLoading(false);
      }
    };


    loadMessages(true);


    const unsubscribe = subscribeToChatMessages(chat.id, (newMessages) => {
      setMessages(newMessages);
    });


    const poll = setInterval(() => loadMessages(false), 8_000);


    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [chat.id, onRefetchChats]);


  useEffect(() => {
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


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);


  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);


  const handleRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    setRenaming(true);
    try {
      const res = await updateChatName(chat.id, name);
      if (res.success) {
        setDisplayName(name);
        setShowRenameModal(false);
        setMenuOpen(false);
        onRefetchChats?.();
      } else {
        alert(res.error || 'Error al cambiar nombre');
      }
    } catch (e: any) {
      alert(e.message || 'Error al cambiar nombre');
    } finally {
      setRenaming(false);
    }
  };


  const handleClearChat = async () => {
    setClearing(true);
    try {
      const res = await clearChat(chat.id);
      if (res.success) {
        setMessages([]);
        setShowClearConfirm(false);
        setMenuOpen(false);
        onRefetchChats?.();
      } else {
        alert(res.error || 'Error al vaciar chat');
      }
    } catch (e: any) {
      alert(e.message || 'Error al vaciar chat');
    } finally {
      setClearing(false);
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;


    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);


    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: 'agent',
      timestamp: new Date(),
      status: 'sending',
    };
    setMessages([...messages, optimisticMessage]);


    try {
      const result = await sendTextMessage({
        chatId: chat.id,
        text: messageText,
      });


      if (result.success && result.messageId) {
        const fullChat = await loadChatWithMessages(chat.id);
        if (fullChat) setMessages(fullChat.messages);
        onRefetchChats?.();
      } else {
        setMessages(messages);
        alert(result.error || 'Error al enviar mensaje');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
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


      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        text: caption || (fileType === 'image' ? 'Imagen' : 'Documento'),
        sender: 'agent',
        timestamp: new Date(),
        status: 'sending',
        image: fileType === 'image' ? fileUrl : undefined,
      };
      setMessages([...messages, optimisticMessage]);


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
        return { icon: Bot, bgColor: 'bg-violet-500', name: 'Bot' };
      case 'agent':
        return { icon: UserCircle, bgColor: 'bg-violet-500', name: 'Tú' };
      case 'user':
        return { icon: User, bgColor: 'bg-slate-400', name: displayName };
      default:
        return { icon: User, bgColor: 'bg-slate-400', name: 'Usuario' };
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
      <div className="px-4 md:px-5 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          <img
            src={chat.customerAvatar}
            alt={displayName}
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <h2 className="font-semibold text-slate-900 text-sm tracking-tight">{displayName}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {chat.platform === 'whatsapp' && (whatsAppNumber ? `WhatsApp · ${whatsAppNumber}` : 'WhatsApp')}
              {chat.platform === 'facebook' && 'Facebook'}
              {chat.platform === 'web' && 'Web'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {chat.botActive && (
            <span className="text-[10px] px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg font-semibold border border-violet-100/80">
              Bot activo
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              aria-label="Más opciones"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50">
                <button
                  onClick={() => { setShowInfoPanel(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Info size={15} className="text-slate-400" />
                  Ver información
                </button>
                <button
                  onClick={() => { setShowRenameModal(true); setRenameValue(displayName); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Pencil size={15} className="text-slate-400" />
                  Cambiar nombre
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => { setShowClearConfirm(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} className="text-red-400" />
                  Vaciar chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-2.5 bg-[#f0ede8]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
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
                  <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[82%] md:max-w-[58%]`}>
                    {showAvatar ? (
                      <div className={`${senderInfo.bgColor} text-white rounded-xl p-1.5 flex-shrink-0 w-8 h-8 flex items-center justify-center hidden sm:flex`}>
                        <SenderIcon size={15} />
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0 hidden sm:block" />
                    )}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 ${
                          isOwnMessage
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-br-sm'
                            : message.sender === 'bot'
                            ? 'bg-violet-50 text-slate-900 border border-violet-100/60 rounded-bl-sm'
                            : 'bg-white text-slate-900 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                        {message.image && (
                          <img src={message.image} alt="Adjunto" className="mt-2 rounded-xl max-w-[240px]" />
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 px-0.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-slate-400 font-medium">{formatMessageTime(message.timestamp)}</span>
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
              <div className="bg-violet-500 text-white rounded-xl p-1.5 w-8 h-8 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 md:px-5 py-3 border-t border-slate-200/80 bg-white">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowFileModal(true)}
            disabled={sending}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
            title="Adjuntar"
          >
            <Paperclip size={18} />
          </button>
          <div className="flex-1 min-w-0 bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/15 transition-all">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full resize-none rounded-2xl px-4 py-2.5 bg-transparent focus:outline-none text-sm text-slate-900 placeholder-slate-400"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow transition-all"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>


      <FileUploadModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSend={handleSendFile}
        chatId={chat.id}
      />


      {/* Modal: Cambiar nombre */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Cambiar nombre</h3>
              <button onClick={() => setShowRenameModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nombre del contacto"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 text-sm text-slate-900 placeholder-slate-400 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRename}
                disabled={renaming || !renameValue.trim()}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {renaming ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal: Vaciar chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-slate-200/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Vaciar conversación</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Se eliminarán todos los mensajes de este chat. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearChat}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {clearing ? 'Vaciando...' : 'Vaciar chat'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Panel: Info contacto */}
      {showInfoPanel && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden border border-slate-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Información del contacto</h3>
              <button onClick={() => setShowInfoPanel(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <img
                  src={chat.customerAvatar}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-slate-900 text-sm font-medium">{displayName}</p>
              </div>
              {chat.customerEmail && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-slate-900 text-sm">{chat.customerEmail}</p>
                </div>
              )}
              {chat.customerPhone && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="text-slate-900 text-sm">{chat.customerPhone}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plataforma</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    chat.platform === 'whatsapp' ? 'bg-emerald-400' :
                    chat.platform === 'facebook' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  <p className="text-slate-900 text-sm">
                    {chat.platform === 'whatsapp' && 'WhatsApp'}
                    {chat.platform === 'facebook' && 'Facebook'}
                    {chat.platform === 'web' && 'Web'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50/80 border-t border-slate-100">
              <button
                onClick={() => setShowInfoPanel(false)}
                className="w-full py-2.5 rounded-xl bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setShowInfoPanel(false)} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}