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

  // Abrir chat desde URL (ej. /chats?chat=uuid desde Pedidos > Ir al chat)
  useEffect(() => {
    if (typeof window === 'undefined' || !chats.length) return;
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chat');
    if (chatId && chats.some(c => c.id === chatId)) {
      setSelectedChatId(chatId);
      setShowChatList(false);
    }
  }, [chats]);

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
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 size={24} className="animate-spin text-violet-600" />
      </div>
    );
  }



  if (!organizationId) {
    return (
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conversaciones</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Chats</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona tus conversaciones con clientes</p>
        </div>
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <p className="text-amber-700 text-[13px] leading-relaxed">
              Necesitas crear una organización para ver tus chats. Ve a Configuración para crear una.
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conversaciones</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chats</h2>
        <p className="text-sm text-slate-500 mt-0.5">Gestiona tus conversaciones con clientes</p>
      </div>


      {/* Contenedor principal */}
      <div className="flex-1 flex rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden min-h-0">
        {/* Lista de chats — sidebar */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[340px] lg:w-[360px] xl:w-[380px] flex-shrink-0 border-r border-slate-200/80`}
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
            <div className="h-full w-full flex items-center justify-center bg-slate-50/50">
              <div className="text-center max-w-xs px-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} className="text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Selecciona un chat</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Elige una conversación de la lista para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}