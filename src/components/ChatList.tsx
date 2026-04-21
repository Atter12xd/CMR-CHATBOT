import { useState } from 'react';
import { Search, MessageCircle, X, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Chat } from '../data/mockData';
import { formatTime } from '../data/mockData';
import type { InboxSection } from '../lib/inbox-section';
import { chatMatchesInboxSection } from '../lib/inbox-section';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  inboxSection: InboxSection;
}

type StatusFilter = 'all' | 'active' | 'waiting' | 'resolved';

const INTENT_LABELS: Record<string, string> = {
  preguntando_precio: 'Preguntó precio',
  quiero_comprar: 'Quiere comprar',
  cómo_pago: 'Preguntó pago',
  hacer_pedido: 'Quiere pedir',
};

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
};

const INBOX_LIST_TITLE: Record<InboxSection, string> = {
  whatsapp: 'WhatsApp',
  web: 'Tu web',
  shopify: 'Shopify',
};

const INBOX_EMPTY: Record<InboxSection, { title: string; hint: string }> = {
  whatsapp: {
    title: 'No hay conversaciones de WhatsApp',
    hint: 'Cuando escriban a tu número conectado, aparecerán aquí.',
  },
  web: {
    title: 'No hay conversaciones de tu web',
    hint: 'Incluye el widget en sitios permitidos y chats de Messenger.',
  },
  shopify: {
    title: 'No hay conversaciones desde Shopify',
    hint: 'Activa el embed del tema o escribe desde la tienda con el widget.',
  },
};

export default function ChatList({ chats, selectedChatId, onSelectChat, inboxSection }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [onlyLeads, setOnlyLeads] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (!chatMatchesInboxSection(chat, inboxSection)) return false;
    const matchesSearch =
      chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    const matchesLeads = !onlyLeads || chat.lastIntentAt != null;
    return matchesSearch && matchesStatus && matchesLeads;
  });

  const getPlatformIcon = (platform: Chat['platform'], webChannel: Chat['webChannel']) => {
    if (platform === 'web' && webChannel === 'shopify') {
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#96BF48]/25 shadow-sm shadow-black/10">
          <ShoppingBag size={12} className="text-[#3d5220]" strokeWidth={2} />
        </div>
      );
    }
    switch (platform) {
      case 'facebook':
        return (
          <div className="w-5 h-5 bg-[#1877F2] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm shadow-black/15">
            <span className="text-white text-[9px] font-bold leading-none">f</span>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-5 h-5 bg-[#25D366] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-900/20">
            <span className="text-white text-[9px] font-bold leading-none">W</span>
          </div>
        );
      case 'web':
        return (
          <div className="w-5 h-5 rounded-md bg-app-field border border-app-line flex items-center justify-center flex-shrink-0">
            <MessageCircle size={12} className="text-app-muted" />
          </div>
        );
      default:
        return <MessageCircle size={12} className="text-app-muted flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]';
      case 'waiting':
        return 'bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.25)]';
      case 'resolved':
        return 'bg-app-muted';
      default:
        return 'bg-app-muted';
    }
  };

  const STATUS_TABS: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Activos' },
    { id: 'waiting', label: 'Esperando' },
    { id: 'resolved', label: 'Resueltos' },
  ];

  return (
    <div className="h-full min-w-0 max-w-full w-full flex flex-col overflow-hidden bg-white">
      <div className="pt-[14px] px-[14px] pb-2.5 border-b border-[#E5E7EB] shrink-0 bg-white min-w-0">
        <h3 className="text-sm font-bold text-[#3D3D40] mb-2.5">{INBOX_LIST_TITLE[inboxSection]}</h3>
        <div className="relative group">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6D6D70] group-focus-within:text-brand-500 transition-colors pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-w-0 py-[7px] pl-8 pr-8 border border-[#E5E7EB] rounded-md text-xs text-[#3D3D40] placeholder:text-[#6D6D70] focus:outline-none focus:border-brand-500 font-professional bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[#f3f4f6] transition-colors"
            >
              <X size={13} className="text-[#6D6D70]" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-0.5 pt-2 pb-1.5 -mx-0.5">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`crm-inbox-tab ${statusFilter === t.id ? 'crm-inbox-tab-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyLeads((v) => !v)}
            className={`crm-inbox-tab ${onlyLeads ? 'crm-inbox-tab-active' : ''}`}
          >
            Por cerrar
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-white">
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="w-16 h-16 rounded-ref bg-ref-card border border-app-line flex items-center justify-center mb-4 shadow-sm">
              <Users className="w-8 h-8 text-app-muted" />
            </div>
            <p className="text-sm font-medium text-app-ink">{INBOX_EMPTY[inboxSection].title}</p>
            <p className="text-xs text-app-muted mt-1 max-w-[240px]">{INBOX_EMPTY[inboxSection].hint}</p>
          </motion.div>
        ) : (
          <motion.div
            className="py-0 min-w-0 max-w-full"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {filteredChats.map((chat) => {
              const isActive = selectedChatId === chat.id;
              const hasUnread = chat.unreadCount > 0;
              return (
                <motion.button
                  key={chat.id}
                  type="button"
                  variants={listItem}
                  onClick={() => onSelectChat(chat.id)}
                  whileTap={{ scale: 0.995 }}
                  className={`conversation-item-cmr items-start gap-2.5 ${isActive ? 'active' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.customerAvatar}
                      alt=""
                      className="w-[38px] h-[38px] rounded-full object-cover bg-[#f3f4f6] border border-[#f3f4f6]"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(chat.status)}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden pt-0.5">
                    <div className="text-[13px] font-semibold text-[#3D3D40] truncate leading-tight">
                      {chat.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 mt-px">
                      {getPlatformIcon(chat.platform, chat.webChannel)}
                      <p className="text-[11px] text-[#6D6D70] truncate leading-snug">
                        {chat.lastMessage || 'Sin mensajes'}
                      </p>
                    </div>
                    {(chat.lastIntentAt != null || chat.botActive || chat.status === 'waiting') && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {chat.lastIntentAt != null && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                            }`}
                          >
                            {INTENT_LABELS[chat.lastIntent || ''] || 'Por cerrar'}
                          </span>
                        )}
                        {chat.botActive && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              isActive
                                ? 'bg-brand-500/15 text-brand-800 border-brand-500/35'
                                : 'bg-brand-500/10 text-brand-700 border-brand-500/20'
                            }`}
                          >
                            Bot
                          </span>
                        )}
                        {chat.status === 'waiting' && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              isActive
                                ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                                : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                            }`}
                          >
                            Esperando
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                    <span className="text-[10px] tabular-nums text-[#B8B8BB] leading-none">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                    {hasUnread && (
                      <span className="min-h-[18px] min-w-[18px] px-1 flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
