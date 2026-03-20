import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Bot,
  Loader2,
  Paperclip,
  MoreVertical,
  Pencil,
  Trash2,
  Info,
  X,
  UserRound,
  MessageSquare,
} from 'lucide-react';
import type { Chat, Message } from '../data/mockData';
import { loadChatWithMessages, subscribeToChatMessages, clearChat, updateChatName, updateChatBotActive } from '../services/chats';
import { sendTextMessage, sendImageMessage, sendDocumentMessage, markMessagesAsRead } from '../services/whatsapp-messages';
import MessageStatusIndicator from './MessageStatusIndicator';
import FileUploadModal from './FileUploadModal';
import ChatContactPanel from './ChatContactPanel';
import { useMediaQuery } from '../hooks/useMediaQuery';



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
  const isLg = useMediaQuery('(min-width: 1024px)');



  useEffect(() => {
    if (isLg) setShowInfoPanel(false);
  }, [isLg]);



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
    <div className="h-full w-full flex flex-col bg-transparent min-h-0">
      {/* Header estilo CRM */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 md:px-6 min-h-[4rem] py-2 border-b border-app-line bg-gradient-to-r from-app-card via-app-card to-brand-500/[0.06] backdrop-blur-md flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={{ scale: 0.94 }}
            className="md:hidden p-2 hover:bg-white/[0.08] rounded-xl transition-colors text-slate-400"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="relative flex-shrink-0">
            <div className="rounded-full p-[2px] bg-gradient-to-br from-brand-400 to-purple-600">
              <img
                src={chat.customerAvatar}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover bg-app-card"
              />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-app-card ${
                chat.status === 'active'
                  ? 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]'
                  : chat.status === 'waiting'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-white text-[15px] leading-tight truncate font-display">{displayName}</h2>
            <p className="text-[12px] text-slate-500 leading-tight mt-0.5 truncate">
              {chat.platform === 'whatsapp' && (whatsAppNumber ? `WhatsApp · ${whatsAppNumber}` : 'WhatsApp')}
              {chat.platform === 'facebook' && 'Facebook Messenger'}
              {chat.platform === 'web' && 'Chat Web'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            type="button"
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
            whileTap={{ scale: togglingBot ? 1 : 0.97 }}
            className={`text-[11px] px-3 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
              botActive
                ? 'bg-brand-500/15 text-brand-300 border-brand-500/25 hover:bg-brand-500/25'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
            } ${togglingBot ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={botActive ? 'Pausar bot (modo humano)' : 'Activar bot'}
          >
            {togglingBot ? <Loader2 size={12} className="animate-spin" /> : botActive ? <Bot size={12} /> : <UserRound size={12} />}
            {botActive ? 'Bot' : 'Humano'}
          </motion.button>
          <div className="relative" ref={menuRef}>
            <motion.button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors text-slate-400 hover:text-white"
              aria-label="Más opciones"
            >
              <MoreVertical size={18} />
            </motion.button>
            <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-52 bg-app-card rounded-2xl shadow-app-card border border-app-line py-1.5 z-50 overflow-hidden"
              >
                {!isLg && (
                  <button
                    onClick={() => { setShowInfoPanel(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-300 hover:bg-white/[0.06] transition-colors"
                  >
                    <Info size={14} className="text-slate-500" />
                    Ver información
                  </button>
                )}
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
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 md:px-8 py-5 space-y-1 min-h-0"
        style={{
          backgroundColor: '#0a0e14',
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(42,139,255,0.09), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(147,51,234,0.06), transparent), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e293b' fill-opacity='0.22'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full min-h-[200px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="app-spinner">
                <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
              </div>
              <span className="text-[12px] text-slate-500 font-medium">Cargando mensajes…</span>
            </div>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/30 to-purple-600/30 border border-brand-500/20 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/10">
              <MessageSquare className="w-9 h-9 text-brand-300" />
            </div>
            <h3 className="text-lg font-semibold text-white font-display mb-2">
              Inicia la conversación
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Aún no hay mensajes con {displayName.split(' ')[0]}. Escribe abajo para enviar el primero.
            </p>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender === 'agent';
              const isBot = message.sender === 'bot';
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender !== message.sender ||
                (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 300000;
              const showDateSep = shouldShowDateSeparator(index);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {showDateSep && (
                    <div className="flex justify-center my-4">
                      <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.07] border border-app-line px-3.5 py-1 rounded-full shadow-sm">
                        {getDateLabel(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {isBot && showAvatar && (
                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(42,139,255,0.6)]" />
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.15em]">
                        Bot
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar && index > 0 ? 'mt-2' : ''}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[58%]`}>
                      <div
                        className={`relative px-3.5 py-2.5 shadow-md ${
                          isOwnMessage
                            ? `bg-[#d9fdd3] text-slate-900 border border-emerald-200/50 ${showAvatar ? 'rounded-[1.15rem] rounded-tr-md' : 'rounded-[1.15rem]'}`
                            : isBot
                              ? `bg-gradient-to-br from-brand-500/25 to-purple-600/20 text-white border border-brand-500/25 ${showAvatar ? 'rounded-[1.15rem] rounded-tl-md' : 'rounded-[1.15rem]'}`
                              : `bg-app-card/95 text-slate-100 border border-app-line ${showAvatar ? 'rounded-[1.15rem] rounded-tl-md' : 'rounded-[1.15rem]'}`
                        }`}
                      >
                        <p className="text-[14px] leading-[1.5] whitespace-pre-wrap break-words">{message.text}</p>
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Adjunto"
                            className="mt-2 rounded-xl max-w-[240px] cursor-pointer hover:opacity-95 transition-opacity ring-1 ring-black/5"
                          />
                        )}
                        <div
                          className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <span
                            className={`text-[10px] leading-none select-none ${isOwnMessage ? 'text-slate-600/80' : 'text-slate-400/90'}`}
                          >
                            {formatMessageTime(message.timestamp)}
                          </span>
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
                </motion.div>
              );
            })}
            <AnimatePresence mode="wait">
              {chat.botTyping && (
                <motion.div
                  key="bot-typing"
                  className="flex justify-start mt-3 gap-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-app-card border border-app-line rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                    <div className="flex gap-1.5 items-center h-4">
                      <motion.span
                        className="w-2 h-2 rounded-full bg-slate-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full bg-slate-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full bg-slate-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>


      {/* Input area — estilo CRM */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="px-3 md:px-6 py-3 border-t border-app-line bg-gradient-to-t from-app-card to-[#0e141c] shrink-0 backdrop-blur-md"
      >
        <div className="max-w-3xl mx-auto w-full flex items-end gap-2">
          <motion.button
            type="button"
            onClick={() => setShowFileModal(true)}
            disabled={sending}
            whileTap={{ scale: sending ? 1 : 0.94 }}
            className="p-2.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0 border border-transparent hover:border-brand-500/20"
            title="Adjuntar"
          >
            <Paperclip size={20} />
          </motion.button>
          <div className="flex-1 min-w-0 rounded-2xl border border-app-line bg-white/[0.05] focus-within:border-brand-500/45 focus-within:ring-2 focus-within:ring-brand-500/15 transition-all duration-200 shadow-inner shadow-black/20">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje…"
              rows={1}
              className="w-full resize-none rounded-2xl px-4 py-3 bg-transparent focus:outline-none text-[14px] text-white placeholder-slate-500 leading-snug"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            whileTap={{ scale: newMessage.trim() && !sending ? 0.94 : 1 }}
            className={`h-12 w-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/45 hover:brightness-110'
                : 'bg-white/[0.05] text-slate-600 cursor-not-allowed border border-app-line'
            }`}
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </motion.button>
        </div>
      </motion.div>



      <FileUploadModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSend={handleSendFile}
        chatId={chat.id}
      />



      <AnimatePresence>
        {showRenameModal && (
          <motion.div
            key="rename"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowRenameModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative bg-app-card rounded-2xl shadow-app-card border border-app-line w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-base font-display">Cambiar nombre</h3>
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-app-line focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500/40 text-[14px] text-white placeholder-slate-500 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-app-line text-slate-400 hover:bg-white/[0.05] text-[13px] font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRename}
                  disabled={renaming || !renameValue.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/25 disabled:opacity-40 text-[13px] font-semibold transition-opacity"
                >
                  {renaming ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            key="clear"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative bg-app-card rounded-2xl shadow-app-card border border-app-line w-full max-w-sm p-6"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={20} className="text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base font-display">Vaciar conversación</h3>
                  <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">
                    Se eliminarán todos los mensajes. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-app-line text-slate-400 hover:bg-white/[0.05] text-[13px] font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  disabled={clearing}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-40 text-[13px] font-semibold transition-colors"
                >
                  {clearing ? 'Vaciando...' : 'Vaciar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfoPanel && !isLg && (
          <motion.div
            key="info"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowInfoPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="relative bg-app-card w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-app-card border border-app-line overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatContactPanel
                chat={chat}
                displayName={displayName}
                variant="modal"
                onClose={() => setShowInfoPanel(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}