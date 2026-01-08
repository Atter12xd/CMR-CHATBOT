import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { Chat, Message } from '../data/mockData';
import { mockChats } from '../data/mockData';
import { generateBotResponse, getBotTypingDelay } from '../data/botResponses';
import { initialProducts } from '../data/products';
import { defaultPaymentMethods } from '../data/paymentMethods';
import { addPayment, getAllPayments } from '../data/payments';

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // Marcar mensajes como leídos
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0, messages: chat.messages.map(msg => ({ ...msg, read: true })) }
          : chat
      )
    );
  };

  const handleSendMessage = (chatId: string, message: string, image?: string) => {
    // Aquí se enviaría el mensaje a la API
    console.log('Enviando mensaje:', message, 'a chat:', chatId, image ? 'con imagen' : '');
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    // Si hay una imagen, detectar como comprobante de pago y registrar
    if (image) {
      // Intentar extraer monto del mensaje si está presente (formato: "S/ 100" o "$100" o "100 soles")
      const amountMatch = message.match(/(?:S\/|s\/|soles?|S\/\.)?\s*(\d+(?:\.\d{2})?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      // Detectar método de pago del mensaje
      const messageLower = message.toLowerCase();
      let paymentMethod: 'yape' | 'plin' | 'bcp' | 'otro' = 'otro';
      if (messageLower.includes('yape')) paymentMethod = 'yape';
      else if (messageLower.includes('plin')) paymentMethod = 'plin';
      else if (messageLower.includes('bcp')) paymentMethod = 'bcp';

      // Registrar el pago
      const payment = addPayment({
        customerName: chat.customerName,
        customerEmail: chat.customerEmail,
        customerId: chat.id,
        amount: amount || 0, // Si no se detecta monto, será 0 y se puede editar después
        method: paymentMethod,
        receiptImage: image,
        status: 'pending',
        notes: message || 'Comprobante recibido',
      });

      console.log('Pago registrado:', payment);
      
      // Agregar mensaje del usuario con imagen
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: message || '📸 Comprobante de pago enviado',
                lastMessageTime: new Date(),
                messages: [
                  ...chat.messages,
                  {
                    id: `msg-${Date.now()}`,
                    text: message || 'Comprobante de pago',
                    sender: 'user',
                    timestamp: new Date(),
                    read: true,
                    image: image,
                    isPaymentReceipt: true,
                  },
                ],
                botTyping: true,
              }
            : chat
        )
      );

      // El bot responde automáticamente confirmando el pago
      setTimeout(() => {
        const botResponse = amount > 0
          ? `✅ ¡Comprobante recibido! He registrado tu pago de S/ ${amount.toFixed(2)} por ${paymentMethod.toUpperCase()}. Estaremos verificando y procesando tu pedido. Gracias! 🙏`
          : `✅ ¡Comprobante recibido! Gracias por enviar tu comprobante de pago. Estaremos verificando y procesando tu pedido. Si puedes indicar el monto, sería de gran ayuda. 🙏`;
        
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: botResponse,
                  lastMessageTime: new Date(),
                  messages: [
                    ...chat.messages,
                    {
                      id: `msg-bot-${Date.now()}`,
                      text: botResponse,
                      sender: 'bot',
                      timestamp: new Date(),
                      read: true,
                    },
                  ],
                  botTyping: false,
                }
              : chat
          )
        );
      }, getBotTypingDelay());
      
      return;
    }
    
    // Mensaje de texto normal (sin imagen)
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastMessageTime: new Date(),
              messages: [
                ...chat.messages,
                {
                  id: `msg-${Date.now()}`,
                  text: message,
                  sender: 'agent',
                  timestamp: new Date(),
                  read: true,
                },
              ],
            }
          : chat
      )
    );
  };

  const handleToggleBot = (chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, botActive: !chat.botActive, botTyping: false }
          : chat
      )
    );
  };

  // Simular mensajes del usuario y respuestas del bot
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nuevos mensajes aleatorios del usuario
      if (Math.random() > 0.85 && chats.length > 0) {
        const activeChats = chats.filter(
          c => (c.status === 'active' || c.status === 'waiting') && c.botActive
        );
        
        if (activeChats.length > 0) {
          const randomChat = activeChats[Math.floor(Math.random() * activeChats.length)];
          const userMessages = [
            'Hola, necesito ayuda',
            '¿Cuánto cuesta el envío?',
            'Quiero hacer un pedido',
            '¿Tienen este producto disponible?',
            'Necesito información sobre devoluciones',
          ];
          const userMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
          
          // Agregar mensaje del usuario
          setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === randomChat.id
                ? {
                    ...chat,
                    lastMessage: userMessage,
                    lastMessageTime: new Date(),
                    unreadCount: chat.unreadCount + 1,
                    messages: [
                      ...chat.messages,
                      {
                        id: `msg-user-${Date.now()}`,
                        text: userMessage,
                        sender: 'user',
                        timestamp: new Date(),
                        read: false,
                      },
                    ],
                    botTyping: true,
                  }
                : chat
            )
          );

          // Después de un delay, el bot responde
          setTimeout(() => {
            const botResponse = generateBotResponse(userMessage, initialProducts, defaultPaymentMethods);
            setChats(prevChats =>
              prevChats.map(chat =>
                chat.id === randomChat.id
                  ? {
                      ...chat,
                      lastMessage: botResponse,
                      lastMessageTime: new Date(),
                      messages: [
                        ...chat.messages,
                        {
                          id: `msg-bot-${Date.now()}`,
                          text: botResponse,
                          sender: 'bot',
                          timestamp: new Date(),
                          read: true,
                        },
                      ],
                      botTyping: false,
                    }
                  : chat
              )
            );
          }, getBotTypingDelay());
        }
      }
    }, 15000); // Cada 15 segundos

    return () => clearInterval(interval);
  }, [chats]);

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1">
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId || undefined}
            onSelectChat={handleSelectChat}
          />
        </div>
        <div className="lg:col-span-2">
          <ChatWindow 
            chat={selectedChat} 
            onSendMessage={handleSendMessage}
            onToggleBot={handleToggleBot}
          />
        </div>
      </div>
    </div>
  );
}

