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

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || chat.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-5 h-5 bg-[#1877F2] rounded-md text-white text-xs flex items-center justify-center font-bold">f</div>;
      case 'whatsapp':
        return <div className="w-5 h-5 bg-[#25D366] rounded-md text-white text-xs flex items-center justify-center font-bold">W</div>;
      case 'web':
        return <MessageCircle size={18} className="text-slate-500" />;
      default:
        return <MessageCircle size={18} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'waiting': return 'bg-amber-500';
      case 'resolved': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const activeFiltersCount = (platformFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-slate-50/80">
      <div className="p-4 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-all relative ${showFilters || activeFiltersCount > 0 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            title="Filtros"
          >
            <Filter size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Filtros</span>
              {activeFiltersCount > 0 && (
                <button onClick={() => { setPlatformFilter('all'); setStatusFilter('all'); }} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Limpiar
                </button>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">Plataforma</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'whatsapp', 'facebook', 'web'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${platformFilter === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {p === 'all' ? 'Todas' : p === 'whatsapp' ? 'WhatsApp' : p === 'facebook' ? 'Facebook' : 'Web'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">Estado</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'waiting', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : s === 'waiting' ? 'Esperando' : 'Resueltos'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No hay conversaciones</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full rounded-xl p-3.5 text-left transition-all duration-200 flex items-start gap-3 ${
                  selectedChatId === chat.id
                    ? 'bg-primary-50 border border-primary-200/60 shadow-sm'
                    : 'hover:bg-white/80 border border-transparent hover:border-slate-200/80 hover:shadow-sm'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.customerAvatar}
                    alt={chat.customerName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor(chat.status)} rounded-full border-2 border-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 truncate text-[15px]">
                      {chat.customerName}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getPlatformIcon(chat.platform)}
                    <p className="text-sm text-slate-600 truncate flex-1 leading-snug">
                      {chat.lastMessage || 'Sin mensajes'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {chat.botActive && (
                        <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md font-medium">
                          Bot
                        </span>
                      )}
                      {chat.status === 'waiting' && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md font-medium">
                          Esperando
                        </span>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
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
