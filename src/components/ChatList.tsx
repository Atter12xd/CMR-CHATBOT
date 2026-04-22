import { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
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

  const filteredChats = chats.filter((chat) => {
    if (!chatMatchesInboxSection(chat, inboxSection)) return false;
    const matchesSearch =
      chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    { id: 'active', label: 'Abiertas' },
    { id: 'resolved', label: 'Resueltas' },
    { id: 'waiting', label: 'Pendientes' },
  ];

  return (
    <div className="h-full min-w-0 max-w-full w-full flex flex-col overflow-hidden bg-white">
      <div className="pt-2.5 px-3 pb-1.5 border-b border-[#E5E7EB] shrink-0 bg-white min-w-0">
        <h3 className="text-[15px] font-bold text-[#3D3D40] mb-1.5">{INBOX_LIST_TITLE[inboxSection]}</h3>
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
            className="w-full min-w-0 py-1.5 pl-8 pr-8 border border-[#E5E7EB] rounded-md text-[13px] text-[#3D3D40] placeholder:text-[#6D6D70] focus:outline-none focus:border-brand-500 font-professional bg-white"
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
        <div className="flex flex-wrap gap-0.5 pt-1 pb-1 -mx-0.5">
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
                  className={`conversation-item-cmr items-start ${isActive ? 'active' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.customerAvatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover bg-[#f3f4f6] border border-[#f3f4f6]"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${getStatusColor(chat.status)}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden pt-px">
                    <div className="text-[13px] font-semibold text-[#3D3D40] truncate leading-tight">
                      {chat.customerName}
                    </div>
                    <p className="text-[11px] text-[#6D6D70] truncate leading-snug mt-0.5">
                      {chat.lastMessage || 'Sin mensajes'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0 pt-px">
                    <span className="text-[10px] tabular-nums text-[#B8B8BB] leading-none">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                    {hasUnread && (
                      <span className="h-4 min-w-[16px] px-1 flex items-center justify-center bg-emerald-500 text-white text-[9px] font-bold rounded-full">
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
