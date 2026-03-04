import { useState } from 'react';
import { Search, MessageCircle, Filter } from 'lucide-react';
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


export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [onlyLeads, setOnlyLeads] = useState(false);


  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || chat.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    const matchesLeads = !onlyLeads || (chat.lastIntentAt != null);
    return matchesSearch && matchesPlatform && matchesStatus && matchesLeads;
  });


  const getPlatformIcon = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-5 h-5 bg-[#1877F2] rounded-md text-white text-[10px] flex items-center justify-center font-bold">f</div>;
      case 'whatsapp':
        return <div className="w-5 h-5 bg-[#25D366] rounded-md text-white text-[10px] flex items-center justify-center font-bold">W</div>;
      case 'web':
        return <MessageCircle size={16} className="text-slate-400" />;
      default:
        return <MessageCircle size={16} className="text-slate-400" />;
    }
  };


  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-400';
      case 'waiting': return 'bg-amber-400';
      case 'resolved': return 'bg-slate-300';
      default: return 'bg-slate-300';
    }
  };


  const activeFiltersCount = (platformFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (onlyLeads ? 1 : 0);


  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search + Filter bar */}
      <div className="p-3.5 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-all relative ${
              showFilters || activeFiltersCount > 0
                ? 'bg-violet-50 text-violet-600 border border-violet-200/60'
                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title="Filtros"
          >
            <Filter size={16} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-slate-50/80 rounded-xl p-3.5 space-y-3 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Filtros</span>
              {activeFiltersCount > 0 && (
                <button onClick={() => { setPlatformFilter('all'); setStatusFilter('all'); setOnlyLeads(false); }} className="text-[11px] font-medium text-violet-600 hover:text-violet-700">
                  Limpiar
                </button>
              )}
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 block">Plataforma</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'whatsapp', 'facebook', 'web'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      platformFilter === p
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {p === 'all' ? 'Todas' : p === 'whatsapp' ? 'WhatsApp' : p === 'facebook' ? 'Facebook' : 'Web'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2 block">Estado</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'active', 'waiting', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      statusFilter === s
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : s === 'waiting' ? 'Esperando' : 'Resueltos'}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyLeads}
                onChange={(e) => setOnlyLeads(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500/20"
              />
              <span className="text-[12px] font-medium text-slate-600">Solo por cerrar (con intención de compra)</span>
            </label>
          </div>
        )}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-10 h-10 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">No hay conversaciones</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full rounded-xl p-3 text-left transition-all duration-150 flex items-start gap-3 ${
                  selectedChatId === chat.id
                    ? 'bg-violet-50/80 border border-violet-200/50'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.customerAvatar}
                    alt={chat.customerName}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(chat.status)} rounded-full border-2 border-white`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className={`font-semibold truncate text-sm ${
                      selectedChatId === chat.id ? 'text-violet-900' : 'text-slate-900'
                    }`}>
                      {chat.customerName}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getPlatformIcon(chat.platform)}
                    <p className="text-[13px] text-slate-500 truncate flex-1 leading-snug">
                      {chat.lastMessage || 'Sin mensajes'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {chat.lastIntentAt != null && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100/80 text-emerald-700 rounded-md font-medium">
                          {INTENT_LABELS[chat.lastIntent || ''] || 'Por cerrar'}
                        </span>
                      )}
                      {chat.botActive && (
                        <span className="text-[10px] px-2 py-0.5 bg-violet-100/80 text-violet-600 rounded-md font-medium">
                          Bot
                        </span>
                      )}
                      {chat.status === 'waiting' && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100/80 text-amber-600 rounded-md font-medium">
                          Esperando
                        </span>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-violet-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}