import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
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
import { inboxChannelSubtitle } from '../lib/inbox-section';

const QUICK_REPLY_SNIPPETS = [
  '¡Hola! ¿En qué le puedo ayudar?',
  'Su pedido está confirmado',
  'El envío demora 2-3 días',
  'Gracias por contactarnos',
];

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
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /** Si true, nuevos mensajes / carga mantienen la vista al final; si el usuario sube, pasa a false. */
  const pinToBottomRef = useRef(true);
  const isLg = useMediaQuery('(min-width: 1024px)');

  const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinToBottomRef.current = distanceFromBottom < 100;
  }, []);



  useEffect(() => {
    if (isLg) setShowInfoPanel(false);
  }, [isLg]);



  useEffect(() => {
    setDisplayName(chat.customerName);
    setRenameValue(chat.customerName);
    setBotActive(chat.botActive);
  }, [chat.id, chat.customerName, chat.botActive]);



  useEffect(() => {
    pinToBottomRef.current = true;
    setMessages([]);
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



  /**
   * Tras pintar mensajes: bajar al final si toca (apertura de chat, carga lista, o usuario ya abajo).
   * useLayoutEffect evita un frame visible arriba del todo antes del scroll (p. ej. con animaciones).
   */
  useLayoutEffect(() => {
    const el = messagesScrollRef.current;
    if (loading) return;
    if (messages.length === 0) {
      if (el) el.scrollTop = 0;
      return;
    }
    if (!pinToBottomRef.current) return;
    scrollMessagesToBottom('auto');
    requestAnimationFrame(() => scrollMessagesToBottom('auto'));
  }, [loading, messages, scrollMessagesToBottom]);

  useLayoutEffect(() => {
    if (!chat.botTyping || loading || !pinToBottomRef.current) return;
    scrollMessagesToBottom('auto');
    requestAnimationFrame(() => scrollMessagesToBottom('auto'));
  }, [chat.botTyping, loading, scrollMessagesToBottom]);

  /** Animaciones / imágenes pueden cambiar scrollHeight después del layout. */
  useEffect(() => {
    if (loading || messages.length === 0 || !pinToBottomRef.current) return;
    let timeoutId: number | undefined;
    const id = requestAnimationFrame(() => {
      scrollMessagesToBottom('auto');
      timeoutId = window.setTimeout(() => {
        if (pinToBottomRef.current) scrollMessagesToBottom('auto');
      }, 200);
    });
    return () => {
      cancelAnimationFrame(id);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [loading, messages, scrollMessagesToBottom]);



  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    // Al abrir/cambiar chat, deja el input listo para escribir.
    const t = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [chat.id]);



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
    pinToBottomRef.current = true;

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
      pinToBottomRef.current = true;

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

  const conversationStartedLabel = (d: Date) => {
    const s = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Conversación iniciada el ${s}`;
  };



  return (
    <div className="h-full w-full flex flex-col bg-[#f9fafb] min-h-0">
      {/* Header — .chat-header (wazapp-standalone) */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0 min-h-[52px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={{ scale: 0.94 }}
            className="md:hidden p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors text-[#6D6D70]"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="relative flex-shrink-0">
            <img
              src={chat.customerAvatar}
              alt={displayName}
              className="w-[38px] h-[38px] rounded-full object-cover bg-[#f3f4f6] border border-[#E5E7EB]"
            />
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                chat.status === 'active'
                  ? 'bg-emerald-500'
                  : chat.status === 'waiting'
                    ? 'bg-amber-400'
                    : 'bg-[#B8B8BB]'
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm leading-tight text-[#3D3D40] truncate">{displayName}</h2>
            <p className="text-xs text-[#6D6D70] leading-tight mt-0.5 truncate">
              {[chat.customerPhone, inboxChannelSubtitle(chat, whatsAppNumber)].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
              chat.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : chat.status === 'waiting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-[#f3f4f6] text-[#6D6D70] border-[#E5E7EB]'
            }`}
          >
            {chat.status === 'active' ? 'Abierta' : chat.status === 'waiting' ? 'Esperando' : 'Resuelta'}
          </span>
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
            className={`text-[11px] px-3 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
              botActive
                ? 'bg-brand-500/10 text-brand-700 border-brand-500/25 hover:bg-brand-500/15'
                : 'bg-amber-500/10 text-amber-800 border-amber-500/25 hover:bg-amber-500/15'
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
              className="p-2 hover:bg-app-field rounded-2xl transition-colors text-app-muted hover:text-app-ink"
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
                className="absolute right-0 top-full mt-1.5 w-52 bg-ref-card rounded-ref shadow-md border border-app-line py-1.5 z-50 overflow-hidden"
              >
                {!isLg && (
                  <button
                    onClick={() => { setShowInfoPanel(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-app-ink hover:bg-app-field transition-colors"
                  >
                    <Info size={14} className="text-app-muted" />
                    Ver información
                  </button>
                )}
                <button
                  onClick={() => { setShowRenameModal(true); setRenameValue(displayName); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-app-ink hover:bg-app-field transition-colors"
                >
                  <Pencil size={14} className="text-app-muted" />
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-app-ink hover:bg-app-field transition-colors"
                >
                  {botActive ? <UserRound size={14} className="text-amber-600" /> : <Bot size={14} className="text-brand-600" />}
                  {botActive ? 'Pausar bot' : 'Activar bot'}
                </button>
                <div className="my-1 border-t border-app-line" />
                <button
                  onClick={() => { setShowClearConfirm(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} className="text-rose-600" />
                  Vaciar chat
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Messages — .chat-messages */}
      <div
        ref={messagesScrollRef}
        onScroll={onMessagesScroll}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#f9fafb] px-4 py-3"
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full min-h-[200px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="app-spinner">
                <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              </div>
              <span className="text-[12px] text-app-muted font-medium">Cargando mensajes…</span>
            </div>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-ref-card border border-app-line flex items-center justify-center mb-5 shadow-sm">
              <MessageSquare className="w-9 h-9 text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-app-ink font-professional mb-2">
              Inicia la conversación
            </h3>
            <p className="text-sm text-app-muted max-w-sm leading-relaxed">
              Aún no hay mensajes con {displayName.split(' ')[0]}. Escribe abajo para enviar el primero.
            </p>
          </motion.div>
        ) : (
          <div className="w-full">
            {messages.map((message, index) => {
              const isFromBusiness = message.sender === 'agent' || message.sender === 'bot';
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showGroupBreak = !prevMessage || prevMessage.sender !== message.sender ||
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
                    <div className="flex justify-center my-3">
                      <span className="text-[11px] font-medium text-[#6D6D70] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full">
                        {index === 0 ? conversationStartedLabel(message.timestamp) : getDateLabel(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} ${index > 0 ? (showDateSep ? 'mt-1.5' : showGroupBreak ? 'mt-2' : 'mt-0.5') : ''}`}
                  >
                    <div
                      className={`max-w-[68%] flex flex-col gap-1 ${isFromBusiness ? 'items-end' : 'items-start'}`}
                    >
                      {isFromBusiness && showGroupBreak && (
                        <span className="text-[10px] font-semibold text-[#6D6D70] uppercase tracking-wide pr-0.5">
                          {message.sender === 'bot' ? 'Bot' : 'Tú'}
                        </span>
                      )}
                      <div
                        className={`px-[13px] py-[9px] shadow-none ${
                          isFromBusiness
                            ? 'chat-bubble-agent text-[#3D3D40]'
                            : 'chat-bubble-customer text-[#3D3D40]'
                        }`}
                      >
                        <p className="text-[13px] leading-[1.5] whitespace-pre-wrap break-words">{message.text}</p>
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Adjunto"
                            className="mt-2 rounded-xl max-w-[240px] cursor-pointer hover:opacity-95 transition-opacity ring-1 ring-black/5"
                          />
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-0.5 min-h-[14px] ${isFromBusiness ? 'justify-end' : 'justify-start'}`}
                      >
                        <span className="text-[10px] leading-none select-none text-[#B8B8BB] tabular-nums">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.sender === 'agent' && (
                          <MessageStatusIndicator
                            status={message.status || (message.read ? 'read' : 'sent')}
                            className="flex-shrink-0"
                            tone="light"
                          />
                        )}
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
                  className="flex justify-end mt-3 gap-2 items-end"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="max-w-[68%] flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold text-[#6D6D70] uppercase tracking-wide">Bot</span>
                    <div className="chat-bubble-agent px-4 py-3">
                      <div className="flex gap-1.5 items-center h-4 justify-end">
                        <motion.span
                          className="w-2 h-2 rounded-full bg-brand-500/50"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-brand-500/50"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-brand-500/50"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>


      {/* Quick replies + input — .quick-replies + .chat-input-area */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="shrink-0 border-t border-[#E5E7EB] bg-white"
      >
        <div className="flex flex-wrap gap-1.5 px-4 pt-2 pb-1">
          {QUICK_REPLY_SNIPPETS.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                pinToBottomRef.current = true;
                setNewMessage(text);
                requestAnimationFrame(() => textareaRef.current?.focus());
              }}
              title={text}
              className="px-[11px] py-1 rounded-full border border-brand-500 text-brand-500 text-[12px] font-medium bg-white hover:bg-[#EBF2FF] transition-colors max-w-full text-left leading-snug"
            >
              {text}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 pt-1 pb-2.5">
          <motion.button
            type="button"
            onClick={() => setShowFileModal(true)}
            disabled={sending}
            whileTap={{ scale: sending ? 1 : 0.94 }}
            className="p-2 text-[#6D6D70] hover:text-brand-600 hover:bg-[#EBF2FF] rounded-md transition-colors disabled:opacity-40 flex-shrink-0"
            title="Adjuntar"
          >
            <Paperclip size={18} />
          </motion.button>
          <div className="flex-1 min-w-0 rounded-full border border-[#E5E7EB] bg-white focus-within:border-brand-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full resize-none rounded-full px-[13px] py-2 bg-transparent focus:outline-none text-[13px] text-[#3D3D40] placeholder:text-[#6D6D70] leading-snug font-professional"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            whileTap={{ scale: newMessage.trim() && !sending ? 0.94 : 1 }}
            className={`size-9 rounded-full flex-shrink-0 flex items-center justify-center transition-opacity ${
              newMessage.trim() && !sending
                ? 'bg-brand-500 text-white hover:opacity-[0.85]'
                : 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowRenameModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative bg-ref-card rounded-ref shadow-md border border-app-line w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-app-ink text-base font-professional">Cambiar nombre</h3>
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="p-2 hover:bg-app-field rounded-2xl transition-colors"
                >
                  <X size={16} className="text-app-muted" />
                </button>
              </div>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full px-4 py-3 rounded-ref bg-ref-muted border border-app-line focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500/35 text-sm text-app-ink placeholder:text-app-muted transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-app-line text-app-muted hover:bg-app-field text-[13px] font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRename}
                  disabled={renaming || !renameValue.trim()}
                  className="flex-1 py-2.5 rounded-full bg-brand-500 text-white shadow-md shadow-brand-500/20 disabled:opacity-40 text-sm font-semibold transition-opacity hover:bg-brand-600"
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative bg-ref-card rounded-ref shadow-md border border-app-line w-full max-w-sm p-6"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={20} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-app-ink text-base font-professional">Vaciar conversación</h3>
                  <p className="text-[13px] text-app-muted mt-1.5 leading-relaxed">
                    Se eliminarán todos los mensajes. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-full border border-app-line text-app-muted hover:bg-app-field text-[13px] font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  disabled={clearing}
                  className="flex-1 py-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 text-[13px] font-semibold transition-colors"
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowInfoPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="relative bg-ref-card w-full sm:max-w-md sm:rounded-ref rounded-t-[1.25rem] shadow-md border border-app-line overflow-hidden flex flex-col"
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