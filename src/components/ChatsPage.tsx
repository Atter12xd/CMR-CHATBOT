import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare } from 'lucide-react';
import { createClient } from '../lib/supabase';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatContactPanel from './ChatContactPanel';
import type { Chat } from '../data/mockData';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats, subscribeToChats } from '../services/chats';
import PageHeader from './PageHeader';
import {
  type InboxSection,
  chatMatchesInboxSection,
  inboxSectionForChat,
} from '../lib/inbox-section';



export default function ChatsPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);
  const [inboxSection, setInboxSection] = useState<InboxSection>('whatsapp');



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

  // Abrir chat desde URL (ej. /chats?chat=uuid desde Pedidos > Ir al chat)
  useEffect(() => {
    if (typeof window === 'undefined' || !chats.length) return;
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chat');
    if (chatId && chats.some(c => c.id === chatId)) {
      const row = chats.find(c => c.id === chatId);
      if (row) setInboxSection(inboxSectionForChat(row));
      setSelectedChatId(chatId);
      setShowChatList(false);
    }
  }, [chats]);

  useEffect(() => {
    if (!selectedChatId) return;
    const row = chats.find((c) => c.id === selectedChatId);
    if (!row || !chatMatchesInboxSection(row, inboxSection)) {
      setSelectedChatId(null);
      setShowChatList(true);
    }
  }, [inboxSection, chats, selectedChatId]);

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
        <PageHeader title="Inbox multicanal" description="WhatsApp, tu web y Shopify: cada canal con su propia bandeja." />
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
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
      <PageHeader
        title="WhatsApp CRM"
        description="Gestión de conversaciones con clientes"
        className="mb-0.5"
      />

      {/* Contenedor principal — .crm-layout (wazapp-standalone) */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)]">
        {/* Lista de chats — .crm-conversations */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex min-h-0 w-full md:w-[236px] md:min-w-[236px] md:max-w-[236px] flex-shrink-0 border-r border-[#E5E7EB] overflow-hidden bg-white`}
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            inboxSection={inboxSection}
          />
        </div>


        {/* Ventana de chat + ficha (escritorio lg+) */}
        <div
          className={`${
            !showChatList && selectedChat ? 'flex' : 'hidden'
          } ${selectedChat ? 'md:flex' : 'md:flex'} min-h-0 flex-1 min-w-0 flex-col overflow-hidden bg-[#f9fafb] lg:flex-row`}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
                className="chat-empty-cmr h-full w-full min-w-0"
              >
                <MessageSquare size={48} className="text-[#d1d5db]" strokeWidth={1.5} />
                <p className="text-[13px] text-[#6D6D70]">Selecciona una conversación</p>
              </motion.div>
            )}
          </div>
          {selectedChat && (
            <motion.aside
              key={selectedChat.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="hidden lg:flex w-[312px] min-w-[312px] flex-shrink-0 flex-col border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-white min-h-0 overflow-hidden"
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