import { useState, useEffect, useCallback } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
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
      <div className="flex items-center justify-center p-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          <span className="text-[13px] text-slate-400 font-medium">Cargando conversaciones</span>
        </div>
      </div>
    );
  }



  if (!organizationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Chats</h1>
          <p className="text-slate-400 mt-0.5 text-[13px]">Gestiona tus conversaciones con clientes</p>
        </div>
        <div className="bg-amber-50/60 border border-amber-200/40 rounded-lg p-4">
          <div className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
            <p className="text-amber-700 text-[13px] leading-relaxed">
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
      <div className="mb-3 md:mb-4">
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Chats</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Gestiona tus conversaciones con clientes</p>
      </div>


      {/* Contenedor principal */}
      <div className="flex-1 flex rounded-xl border border-slate-200/60 bg-white shadow-sm shadow-slate-100/50 overflow-hidden min-h-0">
        {/* Lista de chats — sidebar */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[340px] lg:w-[360px] xl:w-[380px] flex-shrink-0 border-r border-slate-200/60`}
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
              whatsAppNumber={selectedChat.platform === 'whatsapp' ? (whatsAppNumber ?? undefined) : undefined}
              onRefetchChats={refetchChats}
              baileysClientId={organizationId ?? undefined}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50/30">
              <div className="text-center max-w-xs px-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-slate-100/80 rounded-xl flex items-center justify-center">
                  <MessageSquare size={22} className="text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Selecciona un chat</h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">Elige una conversación de la lista para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}