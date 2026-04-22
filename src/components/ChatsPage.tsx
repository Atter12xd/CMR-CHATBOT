import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare, Globe, ShoppingBag } from 'lucide-react';
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
  const inboxCounts = useMemo(() => {
    const wa = chats.filter((c) => chatMatchesInboxSection(c, 'whatsapp')).length;
    const web = chats.filter((c) => chatMatchesInboxSection(c, 'web')).length;
    const shop = chats.filter((c) => chatMatchesInboxSection(c, 'shopify')).length;
    const unreadWa = chats
      .filter((c) => chatMatchesInboxSection(c, 'whatsapp'))
      .reduce((a, c) => a + (c.unreadCount || 0), 0);
    const unreadWeb = chats
      .filter((c) => chatMatchesInboxSection(c, 'web'))
      .reduce((a, c) => a + (c.unreadCount || 0), 0);
    const unreadShop = chats
      .filter((c) => chatMatchesInboxSection(c, 'shopify'))
      .reduce((a, c) => a + (c.unreadCount || 0), 0);
    return { wa, web, shop, unreadWa, unreadWeb, unreadShop };
  }, [chats]);

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
      <div
        className={`rounded-lg border border-[#E5E7EB] bg-[#f3f4f6]/90 p-1 ${
          selectedChat ? 'hidden md:block' : 'block'
        }`}
      >
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {(
            [
              {
                id: 'whatsapp' as const,
                label: 'WhatsApp',
                sub: 'Conversaciones del número conectado',
                Icon: MessageSquare,
                count: inboxCounts.wa,
                unread: inboxCounts.unreadWa,
                iconBg: 'bg-emerald-500/15 text-emerald-700',
              },
              {
                id: 'web' as const,
                label: 'Tu web',
                sub: 'Widget en tu sitio y Facebook Messenger',
                Icon: Globe,
                count: inboxCounts.web,
                unread: inboxCounts.unreadWeb,
                iconBg: 'bg-sky-500/12 text-sky-700',
              },
              {
                id: 'shopify' as const,
                label: 'Shopify',
                sub: 'Widget en la tienda enlazada por OAuth',
                Icon: ShoppingBag,
                count: inboxCounts.shop,
                unread: inboxCounts.unreadShop,
                iconBg: 'bg-[#96BF48]/22 text-[#3d5220]',
              },
            ] as const
          ).map((tab) => {
            const active = inboxSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInboxSection(tab.id)}
                className={`flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 ${
                  active
                    ? 'border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)]'
                    : 'border border-transparent hover:bg-white/75'
                }`}
              >
                <div
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${tab.iconBg}`}
                >
                  <tab.Icon className="size-[18px]" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[13px] font-bold ${active ? 'text-[#1a1a1c]' : 'text-[#3D3D40]'}`}
                    >
                      {tab.label}
                    </span>
                    <span className="tabular-nums text-[15px] font-extrabold text-[#1a1a1c]">{tab.count}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#6D6D70]">{tab.sub}</p>
                  {tab.unread > 0 ? (
                    <p className="mt-1 text-[10px] font-semibold text-brand-600">{tab.unread} sin leer</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

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