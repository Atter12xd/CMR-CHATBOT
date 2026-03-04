import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '../lib/supabase';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { Chat } from '../data/mockData';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats, subscribeToChats } from '../services/chats';


export default function ChatsPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);


  const refetchChats = useCallback(async () => {
    if (!organizationId) return;
    try {
      const list = await loadChats(organizationId);
      setChats(list);
    } catch (e) {
      console.error('Error refetch chats:', e);
    }
  }, [organizationId]);


  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }


    const fetchChats = async () => {
      try {
        setLoading(true);
        const loadedChats = await loadChats(organizationId);
        setChats(loadedChats);
      } catch (error) {
        console.error('Error cargando chats:', error);
      } finally {
        setLoading(false);
      }
    };


    fetchChats();


    const unsubscribe = subscribeToChats(organizationId, (updatedChats) => {
      setChats(updatedChats);
    });


    const pollInterval = setInterval(() => {
      refetchChats();
    }, 12_000);


    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [organizationId, refetchChats]);


  // Cargar número de WhatsApp conectado
  useEffect(() => {
    if (!organizationId) return;
    const supabase = createClient();
    supabase
      .from('whatsapp_integrations')
      .select('phone_number')
      .eq('organization_id', organizationId)
      .eq('status', 'connected')
      .maybeSingle()
      .then(({ data }) => setWhatsAppNumber(data?.phone_number ?? null));
  }, [organizationId]);


  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;


  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatList(false);
  };


  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChatId(null);
  };


  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          <span className="text-sm text-slate-400 font-medium">Cargando conversaciones...</span>
        </div>
      </div>
    );
  }


  if (!organizationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chats</h1>
          <p className="text-slate-500 mt-1 text-sm">Gestiona tus conversaciones con clientes</p>
        </div>
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
            <p className="text-amber-800 text-sm leading-relaxed">
              Necesitas crear una organización para ver tus chats. Ve a Configuración para crear una.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 md:mb-5">
        <h1 className="text-2xl md:text-[1.65rem] font-bold text-slate-900 tracking-tight">Chats</h1>
        <p className="text-sm text-slate-500 mt-1">Gestiona tus conversaciones con clientes</p>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 flex rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden min-h-0">
        {/* Lista de chats — sidebar */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[380px] lg:w-[400px] xl:w-[420px] flex-shrink-0 border-r border-slate-200/80`}
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Ventana de chat */}
        <div
          className={`${
            !showChatList && selectedChat ? 'flex' : 'hidden'
          } ${selectedChat ? 'md:flex' : 'md:flex'} flex-1 min-w-0`}
        >
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={handleBackToList}
              whatsAppNumber={selectedChat.platform === 'whatsapp' ? whatsAppNumber : undefined}
              onRefetchChats={refetchChats}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50/50">
              <div className="text-center max-w-sm px-6">
                <div className="w-20 h-20 mx-auto mb-5 bg-violet-50 rounded-2xl flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">Selecciona un chat</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}