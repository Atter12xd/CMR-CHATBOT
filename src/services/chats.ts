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
        customerPhone: chat.customer_phone ?? null,
        customerAvatar: avatarUrl,
        lastMessage: '',
        lastMessageTime: chat.last_message_at ? new Date(chat.last_message_at) : new Date(),
        unreadCount: chat.unread_count || 0,
        status: chat.status as 'active' | 'waiting' | 'resolved',
        platform: chat.platform as 'facebook' | 'whatsapp' | 'web',
        messages: [],
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
      sender: msg.sender as 'user' | 'agent' | 'bot',
      timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
      status: (msg.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed') || 'sent',
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
      customerPhone: chat.customer_phone ?? null,
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
 * Suscripción en tiempo real a cambios en chats (optimizada)
 */
export function subscribeToChats(
  organizationId: string,
  callback: (chats: Chat[]) => void
) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastUpdate = Date.now();

  const debouncedReload = async () => {
    // Debounce: solo recargar si pasaron al menos 1 segundo desde la última actualización
    const now = Date.now();
    if (now - lastUpdate < 1000) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        lastUpdate = Date.now();
        loadChats(organizationId).then(callback).catch(console.error);
      }, 1000);
      return;
    }
    
    lastUpdate = Date.now();
    try {
      const chats = await loadChats(organizationId);
      callback(chats);
    } catch (error) {
      console.error('Error recargando chats:', error);
    }
  };

  const subscription = supabase
    .channel(`chats-changes-${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `organization_id=eq.${organizationId}`,
      },
      debouncedReload
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      debouncedReload
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    subscription.unsubscribe();
  };
}

/**
 * Suscripción en tiempo real a mensajes de un chat específico
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: Message[]) => void
) {
  const subscription = supabase
    .channel(`chat-messages-${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      async () => {
        // Recargar solo los mensajes de este chat
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (!error && messages) {
          const transformedMessages: Message[] = messages.map((msg) => ({
            id: msg.id,
            text: msg.text || '',
            sender: msg.sender as 'user' | 'agent' | 'bot',
            timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
            status: (msg.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed') || 'sent',
            image: msg.image_url || undefined,
            isPaymentReceipt: msg.is_payment_receipt || false,
          }));
          callback(transformedMessages);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Vacía el chat: borra todos los mensajes y actualiza last_message_at / unread_count.
 */
export async function clearChat(chatId: string): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No hay sesión' };

  try {
    const { error: delErr } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    if (delErr) throw delErr;

    await supabase
      .from('chats')
      .update({ last_message_at: null, unread_count: 0 })
      .eq('id', chatId);

    return { success: true };
  } catch (e: any) {
    console.error('Error vaciando chat:', e);
    return { success: false, error: e.message || 'Error al vaciar chat' };
  }
}

/**
 * Actualiza el nombre del contacto del chat.
 */
export async function updateChatName(chatId: string, customerName: string): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No hay sesión' };

  const name = (customerName || '').trim();
  if (!name) return { success: false, error: 'El nombre no puede estar vacío' };

  try {
    const { error } = await supabase
      .from('chats')
      .update({ customer_name: name })
      .eq('id', chatId);

    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.error('Error actualizando nombre:', e);
    return { success: false, error: e.message || 'Error al cambiar nombre' };
  }
}
