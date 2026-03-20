import { useState } from 'react';
import { Search, MessageCircle, Filter, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chat } from '../data/mockData';
import { formatTime } from '../data/mockData';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

type PlatformFilter = 'all' | 'facebook' | 'whatsapp' | 'web';
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

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [onlyLeads, setOnlyLeads] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || chat.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    const matchesLeads = !onlyLeads || chat.lastIntentAt != null;
    return matchesSearch && matchesPlatform && matchesStatus && matchesLeads;
  });

  const getPlatformIcon = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return (
          <div className="w-5 h-5 bg-[#1877F2] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-900/30">
            <span className="text-white text-[9px] font-bold leading-none">f</span>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-5 h-5 bg-[#25D366] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-900/30">
            <span className="text-white text-[9px] font-bold leading-none">W</span>
          </div>
        );
      case 'web':
        return (
          <div className="w-5 h-5 rounded-md bg-white/[0.08] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
            <MessageCircle size={12} className="text-slate-400" />
          </div>
        );
      default:
        return <MessageCircle size={12} className="text-slate-400 flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]';
      case 'waiting':
        return 'bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]';
      case 'resolved':
        return 'bg-slate-500';
      default:
        return 'bg-slate-500';
    }
  };

  const activeFiltersCount =
    (platformFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (onlyLeads ? 1 : 0);

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="h-full min-w-0 max-w-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-app-card to-[#0c1018]">
      {/* Toolbar CRM */}
      <div className="p-4 border-b border-app-line space-y-3 shrink-0 bg-white/[0.02] min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0 group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors"
            />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 max-w-full pl-10 pr-9 py-2.5 bg-white/[0.05] border border-app-line rounded-xl text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/45 focus:ring-2 focus:ring-brand-500/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>
          <motion.button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            whileTap={{ scale: 0.96 }}
            className={`p-2.5 rounded-xl transition-all relative border ${
              showFilters || activeFiltersCount > 0
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-400 shadow-lg shadow-brand-500/10'
                : 'bg-white/[0.04] border-app-line text-slate-400 hover:bg-white/[0.07] hover:text-slate-200'
            }`}
            title="Filtros"
          >
            <Filter size={16} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-xl p-3.5 space-y-3.5 border border-app-line bg-white/[0.03] backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                    Filtros
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformFilter('all');
                        setStatusFilter('all');
                        setOnlyLeads(false);
                      }}
                      className="text-[11px] font-medium text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Plataforma
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'whatsapp', 'facebook', 'web'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatformFilter(p)}
                        className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all ${
                          platformFilter === p
                            ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/25'
                            : 'bg-white/[0.04] text-slate-400 border border-app-line hover:bg-white/[0.07] hover:text-slate-200'
                        }`}
                      >
                        {p === 'all' ? 'Todas' : p === 'whatsapp' ? 'WhatsApp' : p === 'facebook' ? 'Facebook' : 'Web'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Estado
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'active', 'waiting', 'resolved'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all ${
                          statusFilter === s
                            ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/25'
                            : 'bg-white/[0.04] text-slate-400 border border-app-line hover:bg-white/[0.07] hover:text-slate-200'
                        }`}
                      >
                        {s === 'all'
                          ? 'Todos'
                          : s === 'active'
                            ? 'Activos'
                            : s === 'waiting'
                              ? 'Esperando'
                              : 'Resueltos'}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={onlyLeads}
                    onChange={(e) => setOnlyLeads(e.target.checked)}
                    className="w-4 h-4 rounded border-app-line bg-white/[0.05] text-brand-500 focus:ring-brand-500/30 focus:ring-offset-0 focus:ring-2"
                  />
                  <span className="text-[12px] font-medium text-slate-400">
                    Solo por cerrar (intención de compra)
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista estilo CRM */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-600/20 border border-brand-500/20 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">No hay conversaciones</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              Prueba otro filtro o espera nuevos mensajes.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="py-2 px-2 min-w-0 max-w-full"
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
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  whileTap={{ scale: 0.995 }}
                  className={`w-full min-w-0 max-w-full p-3.5 mb-1 rounded-xl text-left transition-[box-shadow,border-color] flex gap-3 items-start border border-transparent ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/12 to-purple-600/10 border-brand-500/25 shadow-[inset_3px_0_0_0_rgb(42,139,255)]'
                      : 'hover:border-app-line'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`rounded-full p-[2px] bg-gradient-to-br from-brand-400 to-purple-600 ${
                        isActive ? 'ring-2 ring-brand-400/40' : ''
                      }`}
                    >
                      <img
                        src={chat.customerAvatar}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover bg-app-card"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#101622] ${getStatusColor(chat.status)}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-0.5 min-w-0">
                      <h3
                        className={`truncate min-w-0 flex-1 text-[14px] leading-tight ${
                          hasUnread ? 'font-semibold text-white' : 'font-medium text-slate-200'
                        }`}
                      >
                        {chat.customerName}
                      </h3>
                      <span className="text-[11px] text-slate-500 flex-shrink-0 tabular-nums">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 min-w-0">
                      {getPlatformIcon(chat.platform)}
                      <p className="text-[12px] text-slate-500 truncate min-w-0 flex-1 leading-snug">
                        {chat.lastMessage || 'Sin mensajes'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {chat.lastIntentAt != null && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md font-medium border border-emerald-500/20">
                            {INTENT_LABELS[chat.lastIntent || ''] || 'Por cerrar'}
                          </span>
                        )}
                        {chat.botActive && (
                          <span className="text-[10px] px-2 py-0.5 bg-brand-500/15 text-brand-300 rounded-md font-medium border border-brand-500/25">
                            Bot
                          </span>
                        )}
                        {chat.status === 'waiting' && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-md font-medium border border-amber-500/20">
                            Esperando
                          </span>
                        )}
                      </div>
                      {hasUnread && (
                        <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-gradient-to-r from-brand-500 to-purple-600 text-white text-[11px] font-bold rounded-full shadow-md shadow-brand-500/30">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
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
