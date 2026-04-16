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
          <Loader2 size={20} className="animate-spin text-brand-500" />
        </div>
      </div>
    );
  }



  if (!organizationId) {
    return (
      <div className="space-y-5">
        <PageHeader title="WhatsApp CRM" description="Gestión de conversaciones con clientes" />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
            <p className="text-app-muted text-[13px] leading-relaxed">
              Necesitas crear una organización para ver tus chats. Ve a Configuración para crear una.
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="h-full min-h-0 flex flex-col gap-5">
      <div className={`${selectedChat ? 'hidden md:block' : 'block'}`}>
        <PageHeader title="WhatsApp CRM" description="Gestión de conversaciones con clientes" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${selectedChat ? 'hidden md:grid' : 'grid'}`}
      >
        {[
          {
            label: 'Conversaciones',
            value: chatStats.total,
            icon: Users,
            box: 'bg-[#EBF2FF] text-brand-500',
          },
          {
            label: 'Activas',
            value: chatStats.active,
            icon: MessageSquare,
            box: 'bg-[#ECFDF5] text-emerald-500',
          },
          {
            label: 'Sin leer',
            value: chatStats.unread,
            icon: Bell,
            box: 'bg-[#FFFBEB] text-amber-500',
          },
          {
            label: 'Con bot',
            value: chatStats.botOn,
            icon: Bot,
            box: 'bg-[#F5F3FF] text-violet-500',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)] flex items-center gap-3.5 transition-shadow hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,.07),0_2px_4px_-1px_rgba(0,0,0,.05)]"
          >
            <div
              className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 ${s.box}`}
            >
              <s.icon className="size-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[26px] font-extrabold text-[#1a1a1c] leading-none tabular-nums">{s.value}</div>
              <div className="text-xs font-medium text-[#6D6D70] mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Contenedor principal — .crm-layout */}
      <div className="flex flex-1 min-h-0 min-w-0 rounded-lg border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)] md:min-h-[560px]">
        {/* Lista de chats — .crm-conversations */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[260px] md:min-w-[260px] md:max-w-[260px] flex-shrink-0 border-r border-[#E5E7EB] overflow-hidden bg-white`}
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
          } ${selectedChat ? 'md:flex' : 'md:flex'} flex-1 min-w-0 flex-col lg:flex-row min-h-0 overflow-hidden bg-[#f9fafb]`}
        >
          <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
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
                className="h-full w-full min-w-0 flex items-center justify-center"
              >
                <div className="text-center max-w-sm px-8 text-[#9ca3af]">
                  <MessageSquare size={48} className="mx-auto mb-2 opacity-80" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#6D6D70]">Selecciona una conversación</p>
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
              className="hidden lg:flex w-[280px] min-w-[280px] flex-shrink-0 flex-col border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-white min-h-0 overflow-hidden"
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