import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare, Users, Bell, Bot } from 'lucide-react';
import { createClient } from '../lib/supabase';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatContactPanel from './ChatContactPanel';
import type { Chat } from '../data/mockData';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats, subscribeToChats } from '../services/chats';
import PageHeader from './PageHeader';



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
      .then(({ data }) => {
        const row = data as { phone_number?: string | null } | null | undefined;
        setWhatsAppNumber(row?.phone_number ?? null);
      });
  }, [organizationId]);



  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  const chatStats = useMemo(() => {
    const unread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    const active = chats.filter((c) => c.status === 'active').length;
    const botOn = chats.filter((c) => c.botActive).length;
    return { total: chats.length, unread, active, botOn };
  }, [chats]);

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
        <div className="app-spinner">
          <Loader2 size={20} className="animate-spin text-brand-400" />
        </div>
      </div>
    );
  }



  if (!organizationId) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Conversaciones"
          title="Chats"
          description="Gestiona tus conversaciones con clientes."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
            <p className="text-slate-400 text-[13px] leading-relaxed">
              Necesitas crear una organización para ver tus chats. Ve a Configuración para crear una.
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full space-y-5">
      <PageHeader
        eyebrow="Conversaciones"
        title="Chats"
        description="Gestiona tus conversaciones con clientes."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Conversaciones', value: chatStats.total, icon: Users, accent: 'text-brand-400' },
          { label: 'Activas', value: chatStats.active, icon: MessageSquare, accent: 'text-emerald-400' },
          { label: 'Sin leer', value: chatStats.unread, icon: Bell, accent: 'text-amber-400' },
          { label: 'Con bot', value: chatStats.botOn, icon: Bot, accent: 'text-purple-400' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-app-line bg-gradient-to-br from-white/[0.05] to-transparent px-4 py-3 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg bg-white/[0.06] border border-app-line ${s.accent}`}>
              <s.icon className="size-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-white tabular-nums font-display">{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Contenedor principal */}
      <div className="flex-1 flex rounded-2xl border border-app-line bg-app-card overflow-hidden min-h-0 shadow-app-card min-h-[420px] md:min-h-[560px]">
        {/* Lista de chats — sidebar */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[360px] lg:w-[384px] flex-shrink-0 border-r border-app-line`}
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        </div>


        {/* Ventana de chat + ficha (escritorio lg+) */}
        <div
          className={`${
            !showChatList && selectedChat ? 'flex' : 'hidden'
          } ${selectedChat ? 'md:flex' : 'md:flex'} flex-1 min-w-0 flex-col lg:flex-row min-h-0`}
        >
          <div className="flex-1 min-w-0 min-h-0 flex flex-col">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                onBack={handleBackToList}
                whatsAppNumber={selectedChat.platform === 'whatsapp' ? (whatsAppNumber ?? undefined) : undefined}
                onRefetchChats={refetchChats}
                baileysClientId={organizationId ?? undefined}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full w-full flex items-center justify-center bg-[#0a0e14]/50"
              >
                <div className="text-center max-w-sm px-8">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-brand-500/25 to-purple-600/25 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/10">
                    <MessageSquare size={36} className="text-brand-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-display mb-2">Selecciona una conversación</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Elige un chat en la lista para ver mensajes y responder a tus clientes.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
          {selectedChat && (
            <motion.aside
              key={selectedChat.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="hidden lg:flex w-[300px] xl:w-[320px] flex-shrink-0 flex-col border-t lg:border-t-0 lg:border-l border-app-line bg-[#080c11]/80 min-h-0 overflow-hidden"
            >
              <ChatContactPanel
                chat={selectedChat}
                displayName={selectedChat.customerName}
                variant="sidebar"
              />
            </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
}