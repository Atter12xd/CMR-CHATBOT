import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, UserCircle, Loader2, Paperclip, MoreVertical, Pencil, Trash2, Info, X, UserRound } from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { loadChatWithMessages, subscribeToChatMessages, clearChat, updateChatName, updateChatBotActive } from '../services/chats';
import { sendTextMessage, sendImageMessage, sendDocumentMessage, markMessagesAsRead } from '../services/whatsapp-messages';
import MessageStatusIndicator from './MessageStatusIndicator';
import FileUploadModal from './FileUploadModal';



interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
  whatsAppNumber?: string;
  onRefetchChats?: () => void | Promise<void>;
  /** ID de organización = clientId de Baileys. Si se pasa y el chat es WhatsApp, el envío usa la API de Baileys. */
  baileysClientId?: string | null;
}



export default function ChatWindow({ chat, onBack, whatsAppNumber, onRefetchChats, baileysClientId }: ChatWindowProps) {
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
  const [botActive, setBotActive] = useState(chat.botActive);
  const [togglingBot, setTogglingBot] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    setDisplayName(chat.customerName);
    setRenameValue(chat.customerName);
    setBotActive(chat.botActive);
  }, [chat.id, chat.customerName, chat.botActive]);



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
        ...(chat.platform === 'whatsapp' && baileysClientId != null && baileysClientId !== '' && chat.customerPhone
          ? { baileysClientId, baileysTo: chat.customerPhone }
          : {}),
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
        return { icon: Bot, bgColor: 'bg-violet-600', name: 'Bot' };
      case 'agent':
        return { icon: UserCircle, bgColor: 'bg-violet-600', name: 'Tú' };
      case 'user':
        return { icon: User, bgColor: 'bg-slate-500', name: displayName };
      default:
        return { icon: User, bgColor: 'bg-slate-500', name: 'Usuario' };
    }
  };



  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };



  // Group messages by date
  const getDateLabel = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoy';
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const curr = new Date(messages[index].timestamp).toDateString();
    const prev = new Date(messages[index - 1].timestamp).toDateString();
    return curr !== prev;
  };



  return (
    <div className="h-full w-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="px-4 md:px-5 py-2.5 border-b border-white/[0.06] bg-app-card/95 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-400" />
          </button>
          <div className="relative">
            <img
              src={chat.customerAvatar}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/[0.08]"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-app-card ${
              chat.status === 'active' ? 'bg-emerald-500' : chat.status === 'waiting' ? 'bg-amber-400' : 'bg-slate-500'
            }`} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-white text-[13px] leading-tight truncate">{displayName}</h2>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              {chat.platform === 'whatsapp' && (whatsAppNumber ? `WhatsApp · ${whatsAppNumber}` : 'WhatsApp')}
              {chat.platform === 'facebook' && 'Facebook Messenger'}
              {chat.platform === 'web' && 'Chat Web'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              if (togglingBot) return;
              setTogglingBot(true);
              const res = await updateChatBotActive(chat.id, !botActive);
              if (res.success) {
                setBotActive(!botActive);
                onRefetchChats?.();
              }
              setTogglingBot(false);
            }}
            disabled={togglingBot}
            className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
              botActive
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            } ${togglingBot ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={botActive ? 'Pausar bot (modo humano)' : 'Activar bot'}
          >
            {togglingBot ? <Loader2 size={12} className="animate-spin" /> : botActive ? <Bot size={12} /> : <UserRound size={12} />}
            {botActive ? 'Bot' : 'Humano'}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors text-slate-400 hover:text-white"
              aria-label="Más opciones"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-app-card rounded-2xl shadow-lg border border-white/[0.06] py-1.5 z-50">
                <button
                  onClick={() => { setShowInfoPanel(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  <Info size={14} className="text-slate-500" />
                  Ver información
                </button>
                <button
                  onClick={() => { setShowRenameModal(true); setRenameValue(displayName); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  <Pencil size={14} className="text-slate-500" />
                  Cambiar nombre
                </button>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    if (togglingBot) return;
                    setTogglingBot(true);
                    const res = await updateChatBotActive(chat.id, !botActive);
                    if (res.success) {
                      setBotActive(!botActive);
                      onRefetchChats?.();
                    }
                    setTogglingBot(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  {botActive ? <UserRound size={14} className="text-amber-400" /> : <Bot size={14} className="text-blue-400" />}
                  {botActive ? 'Pausar bot' : 'Activar bot'}
                </button>
                <div className="my-1 border-t border-white/[0.04]" />
                <button
                  onClick={() => { setShowClearConfirm(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} className="text-rose-400" />
                  Vaciar chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-1"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e293b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              </div>
              <span className="text-[12px] text-slate-500 font-medium">Cargando mensajes</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const senderInfo = getMessageSender(message.sender);
              const isOwnMessage = message.sender === 'agent';
              const isBot = message.sender === 'bot';
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender !== message.sender ||
                (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 300000;
              const showDateSep = shouldShowDateSeparator(index);

              // Tail logic: show tail only on first message of a group
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
              const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender ||
                (new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) > 300000;

              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDateSep && (
                    <div className="flex justify-center my-3">
                      <span className="text-[11px] font-medium text-slate-500 bg-white/[0.06] border border-white/[0.06] px-3 py-1 rounded-lg">
                        {getDateLabel(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Bot label */}
                  {isBot && showAvatar && (
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Bot</span>
                    </div>
                  )}

                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar && index > 0 ? 'mt-2' : ''}`}>
                    <div className={`max-w-[80%] md:max-w-[55%]`}>
                      <div
                        className={`relative px-3 py-2 ${
                          isOwnMessage
                            ? `bg-[#dcf8c6] text-slate-900 ${showAvatar ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl'}`
                            : isBot
                            ? `bg-blue-500/20 text-white border border-blue-500/30 ${showAvatar ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl'}`
                            : `bg-app-card/95 text-slate-100 border border-white/[0.06] ${showAvatar ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl'}`
                        }`}
                      >
                        <p className="text-[13.5px] leading-[1.45] whitespace-pre-wrap break-words">{message.text}</p>
                        {message.image && (
                          <img src={message.image} alt="Adjunto" className="mt-1.5 rounded-lg max-w-[220px] cursor-pointer hover:opacity-95 transition-opacity" />
                        )}
                        {/* Inline timestamp */}
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-slate-400/80 leading-none select-none">{formatMessageTime(message.timestamp)}</span>
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
                </div>
              );
            })}
          </>
        )}
        {chat.botTyping && (
          <div className="flex justify-start mt-2">
            <div className="bg-app-card/95 border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '140ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '280ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>


      {/* Input area */}
      <div className="px-3 md:px-4 py-2.5 border-t border-white/[0.06] bg-app-card/95 shrink-0">
        <div className="flex items-end gap-1.5">
          <button
            onClick={() => setShowFileModal(true)}
            disabled={sending}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 disabled:opacity-40 flex-shrink-0"
            title="Adjuntar"
          >
            <Paperclip size={18} />
          </button>
          <div className="flex-1 min-w-0 bg-white/[0.04] rounded-xl border border-white/[0.08] focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full resize-none rounded-xl px-3.5 py-2.5 bg-transparent focus:outline-none text-[13px] text-white placeholder-slate-500"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-xl flex-shrink-0 transition-all duration-200 ${
              newMessage.trim() && !sending
                ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20'
                : 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/[0.06]'
            }`}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-app-card rounded-2xl shadow-lg border border-white/[0.06] w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Cambiar nombre</h3>
              <button onClick={() => setShowRenameModal(false)} className="p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors">
                <X size={15} className="text-slate-400" />
              </button>
            </div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nombre del contacto"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 text-[13px] text-white placeholder-slate-500 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.06] text-slate-400 hover:bg-white/[0.04] text-[13px] font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRename}
                disabled={renaming || !renameValue.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20 disabled:opacity-40 text-[13px] font-medium transition-colors"
              >
                {renaming ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal: Vaciar chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-app-card rounded-2xl shadow-lg border border-white/[0.06] w-full max-w-sm p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Vaciar conversación</h3>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                  Se eliminarán todos los mensajes. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.06] text-slate-400 hover:bg-white/[0.04] text-[13px] font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearChat}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-40 text-[13px] font-medium transition-colors"
              >
                {clearing ? 'Vaciando...' : 'Vaciar'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Panel: Info contacto */}
      {showInfoPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="bg-app-card w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-lg border border-white/[0.06] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Información del contacto</h3>
              <button onClick={() => setShowInfoPanel(false)} className="p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors">
                <X size={15} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex justify-center">
                <img
                  src={chat.customerAvatar}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/[0.08]"
                />
              </div>
              <div className="space-y-3">
                <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Nombre</p>
                  <p className="text-white text-[13px] font-medium">{displayName}</p>
                </div>
                {chat.customerEmail && (
                  <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-slate-200 text-[13px]">{chat.customerEmail}</p>
                  </div>
                )}
                {chat.customerPhone && (
                  <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Teléfono</p>
                    <p className="text-slate-200 text-[13px]">{chat.customerPhone}</p>
                  </div>
                )}
                <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Plataforma</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${
                      chat.platform === 'whatsapp' ? 'bg-emerald-500' :
                      chat.platform === 'facebook' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    <p className="text-slate-200 text-[13px]">
                      {chat.platform === 'whatsapp' && 'WhatsApp'}
                      {chat.platform === 'facebook' && 'Facebook'}
                      {chat.platform === 'web' && 'Web'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => setShowInfoPanel(false)}
                className="w-full py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.04] text-slate-300 hover:bg-white/[0.06] text-[13px] font-medium transition-colors"
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