import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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

  // Cargar chats cuando haya organización
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

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToChats(organizationId, (updatedChats) => {
      setChats(updatedChats);
    });

    return () => {
      unsubscribe();
    };
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-2">Gestiona tus conversaciones con clientes</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            Necesitas crear una organización para ver tus chats. Ve a Configuración para crear una.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header solo en móvil */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chats</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Gestiona tus conversaciones con clientes</p>
      </div>

      {/* Contenedor principal tipo WhatsApp Web */}
      <div className="flex-1 flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden min-h-0">
        {/* Lista de chats - sidebar izquierdo */}
        <div
          className={`${
            showChatList ? 'flex' : 'hidden'
          } md:flex w-full md:w-[400px] lg:w-[420px] xl:w-[450px] flex-shrink-0 border-r border-gray-200`}
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Ventana de chat - área principal */}
        <div
          className={`${
            !showChatList && selectedChat ? 'flex' : 'hidden'
          } ${selectedChat ? 'md:flex' : 'md:flex'} flex-1 min-w-0 bg-gray-50`}
        >
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onBack={handleBackToList}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un chat</h3>
                <p className="text-gray-500">Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
