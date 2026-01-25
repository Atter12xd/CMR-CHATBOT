import { createClient } from '../lib/supabase';

const supabase = createClient();

export interface SendTextMessageRequest {
  chatId: string;
  text: string;
}

export interface SendImageMessageRequest {
  chatId: string;
  imageUrl: string;
  caption?: string;
}

export interface SendDocumentMessageRequest {
  chatId: string;
  documentUrl: string;
  filename: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  whatsappMessageId?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  error?: string;
}

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';

async function invokeSendMessage(session: { access_token: string }, body: object): Promise<SendMessageResponse> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = [j.error, j.details].filter(Boolean).join(' — ') || 'Error al enviar mensaje';
    return { success: false, status: 'failed', error: msg };
  }
  return {
    success: true,
    messageId: j.messageId,
    whatsappMessageId: j.whatsappMessageId,
    status: (j.status as SendMessageResponse['status']) || 'sent',
  };
}

/**
 * Envía un mensaje de texto a WhatsApp
 */
export async function sendTextMessage(
  data: SendTextMessageRequest
): Promise<SendMessageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, status: 'failed', error: 'No hay sesión activa' };
  }
  try {
    return await invokeSendMessage(session, { chatId: data.chatId, text: data.text });
  } catch (err: any) {
    console.error('Error enviando mensaje:', err);
    return {
      success: false,
      status: 'failed',
      error: err.message || 'Error al enviar mensaje',
    };
  }
}

/**
 * Envía un mensaje con imagen a WhatsApp
 */
export async function sendImageMessage(
  data: SendImageMessageRequest
): Promise<SendMessageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, status: 'failed', error: 'No hay sesión activa' };
  }
  try {
    return await invokeSendMessage(session, {
      chatId: data.chatId,
      imageUrl: data.imageUrl,
      text: data.caption,
    });
  } catch (err: any) {
    console.error('Error enviando imagen:', err);
    return {
      success: false,
      status: 'failed',
      error: err.message || 'Error al enviar imagen',
    };
  }
}

/**
 * Envía un documento a WhatsApp
 */
export async function sendDocumentMessage(
  data: SendDocumentMessageRequest
): Promise<SendMessageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, status: 'failed', error: 'No hay sesión activa' };
  }
  try {
    return await invokeSendMessage(session, {
      chatId: data.chatId,
      documentUrl: data.documentUrl,
      filename: data.filename,
    });
  } catch (err: any) {
    console.error('Error enviando documento:', err);
    return {
      success: false,
      status: 'failed',
      error: err.message || 'Error al enviar documento',
    };
  }
}

/**
 * Carga los mensajes de un chat desde Supabase
 */
export async function loadChatMessages(chatId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return messages || [];
  } catch (err: any) {
    console.error('Error cargando mensajes:', err);
    throw err;
  }
}

/**
 * Marca mensajes como leídos
 */
export async function markMessagesAsRead(chatId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    // Actualizar solo el campo read, sin tocar updated_at
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('sender', 'user')
      .eq('read', false);

    if (error) {
      throw error;
    }

    // Actualizar unread_count del chat
    await supabase
      .from('chats')
      .update({ unread_count: 0 })
      .eq('id', chatId);

    return { success: true };
  } catch (err: any) {
    console.error('Error marcando mensajes como leídos:', err);
    // No lanzar el error, solo loguearlo para no interrumpir la experiencia
    return { success: false, error: err.message };
  }
}
