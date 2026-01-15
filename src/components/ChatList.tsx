import { useState } from 'react';
import { Search, MessageCircle, Filter, X } from 'lucide-react';
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
    // Búsqueda por texto
    const matchesSearch = chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (chat.customerEmail && chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro por plataforma
    const matchesPlatform = platformFilter === 'all' || chat.platform === platformFilter;
    
    // Filtro por estado
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: Chat['platform']) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">f</div>;
      case 'whatsapp':
        return <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>;
      case 'web':
        return <MessageCircle size={16} className="text-gray-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const activeFiltersCount = (platformFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setPlatformFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Búsqueda y Filtros */}
      <div className="p-3 border-b border-gray-200 bg-[#f0f2f5] space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors relative ${
              showFilters || activeFiltersCount > 0 ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
            title="Filtros"
          >
            <Filter size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg p-3 space-y-3 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Filtros</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            {/* Filtro por Plataforma */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Plataforma</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPlatformFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    platformFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setPlatformFilter('whatsapp')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    platformFilter === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setPlatformFilter('facebook')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    platformFilter === 'facebook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Facebook
                </button>
                <button
                  onClick={() => setPlatformFilter('web')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    platformFilter === 'web' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Web
                </button>
              </div>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Estado</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setStatusFilter('waiting')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    statusFilter === 'waiting' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Esperando
                </button>
                <button
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    statusFilter === 'resolved' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resueltos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron conversaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full px-3 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                  selectedChatId === chat.id ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.customerAvatar}
                      alt={chat.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor(chat.status)} rounded-full border-2 border-white`} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium text-gray-900 truncate text-[15px]">
                        {chat.customerName}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mb-1">
                      {getPlatformIcon(chat.platform)}
                      <p className="text-sm text-gray-600 truncate flex-1 leading-tight">
                        {chat.lastMessage}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {chat.botActive && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            Bot activo
                          </span>
                        )}
                        {chat.status === 'waiting' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            Esperando
                          </span>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
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
