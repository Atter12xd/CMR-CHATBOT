import { createClient } from '../lib/supabase';
import type { Chat, Message } from '../data/mockData';

const supabase = createClient();

/**
 * Carga todos los chats de una organización desde Supabase
 */
export async function loadChats(organizationId: string): Promise<Chat[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    // Cargar chats con el último mensaje
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('organization_id', organizationId)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw error;
    }

    // Transformar a formato Chat
    const transformedChats: Chat[] = (chats || []).map((chat) => {
      // Generar avatar basado en el nombre
      const avatarUrl = chat.customer_avatar || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customer_name)}&background=0ea5e9&color=fff`;

      return {
        id: chat.id,
        customerName: chat.customer_name,
        customerEmail: chat.customer_email || '',
        customerAvatar: avatarUrl,
        lastMessage: '', // Se actualizará con el último mensaje
        lastMessageTime: chat.last_message_at ? new Date(chat.last_message_at) : new Date(),
        unreadCount: chat.unread_count || 0,
        status: chat.status as 'active' | 'waiting' | 'resolved',
        platform: chat.platform as 'facebook' | 'whatsapp' | 'web',
        messages: [], // Se cargarán cuando se abra el chat
        botActive: chat.bot_active || false,
      };
    });

    // Para cada chat, cargar el último mensaje para mostrar en la lista
    for (const chat of transformedChats) {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastMessage) {
        // Determinar el texto del último mensaje
        if (lastMessage.text) {
          chat.lastMessage = lastMessage.text;
        } else if (lastMessage.image_url) {
          chat.lastMessage = '📷 Imagen';
        } else {
          chat.lastMessage = 'Mensaje';
        }
        chat.lastMessageTime = lastMessage.created_at ? new Date(lastMessage.created_at) : new Date();
      } else {
        chat.lastMessage = 'Sin mensajes';
      }
    }

    return transformedChats;
  } catch (err: any) {
    console.error('Error cargando chats:', err);
    throw err;
  }
}

/**
 * Carga un chat específico con todos sus mensajes
 */
export async function loadChatWithMessages(chatId: string): Promise<Chat | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    // Cargar chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return null;
    }

    // Cargar mensajes
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Transformar mensajes
    const transformedMessages: Message[] = (messages || []).map((msg) => ({
      id: msg.id,
      text: msg.text || '',
      sender: msg.sender_type as 'user' | 'agent' | 'bot',
      timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
      read: msg.read || false,
      image: msg.image_url || undefined,
      isPaymentReceipt: msg.is_payment_receipt || false,
    }));

    // Generar avatar
    const avatarUrl = chat.customer_avatar || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customer_name)}&background=0ea5e9&color=fff`;

    // Transformar a formato Chat
    const transformedChat: Chat = {
      id: chat.id,
      customerName: chat.customer_name,
      customerEmail: chat.customer_email || '',
      customerAvatar: avatarUrl,
      lastMessage: transformedMessages.length > 0 
        ? (transformedMessages[transformedMessages.length - 1].text || 'Mensaje')
        : 'Sin mensajes',
      lastMessageTime: chat.last_message_at ? new Date(chat.last_message_at) : new Date(),
      unreadCount: chat.unread_count || 0,
      status: chat.status as 'active' | 'waiting' | 'resolved',
      platform: chat.platform as 'facebook' | 'whatsapp' | 'web',
      messages: transformedMessages,
      botActive: chat.bot_active || false,
    };

    return transformedChat;
  } catch (err: any) {
    console.error('Error cargando chat con mensajes:', err);
    throw err;
  }
}

/**
 * Suscripción en tiempo real a cambios en chats
 */
export function subscribeToChats(
  organizationId: string,
  callback: (chats: Chat[]) => void
) {
  const subscription = supabase
    .channel('chats-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `organization_id=eq.${organizationId}`,
      },
      async () => {
        // Recargar chats cuando hay cambios
        const chats = await loadChats(organizationId);
        callback(chats);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      async () => {
        // Recargar chats cuando hay nuevos mensajes
        const chats = await loadChats(organizationId);
        callback(chats);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
