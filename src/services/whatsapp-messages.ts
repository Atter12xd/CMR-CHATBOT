import { createClient } from '../lib/supabase';
import { sendBaileysMessage } from './whatsapp-baileys';

const supabase = createClient();

export interface SendTextMessageRequest {
  chatId: string;
  text: string;
  /** Si se pasa, se envía por Baileys (API Contabo) en lugar de Meta. Requiere también baileysTo. */
  baileysClientId?: string;
  /** Número del destinatario (ej. 51931105619). Necesario cuando se usa baileysClientId. */
  baileysTo?: string;
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
 * Envía un mensaje de texto a WhatsApp.
 * Si se pasan baileysClientId y baileysTo, usa la API de Baileys (Contabo); si no, usa la Edge Function de Meta.
 */
export async function sendTextMessage(
  data: SendTextMessageRequest
): Promise<SendMessageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, status: 'failed', error: 'No hay sesión activa' };
  }
  try {
    if (data.baileysClientId && data.baileysTo && data.text) {
      const to = data.baileysTo.replace(/\D/g, '').trim();
      if (!to) {
        return { success: false, status: 'failed', error: 'Número de teléfono no válido' };
      }
      const result = await sendBaileysMessage(data.baileysClientId, to, data.text);
      if (!result.success) {
        return { success: false, status: 'failed', error: result.error || 'Error al enviar por WhatsApp' };
      }
      const { data: savedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          chat_id: data.chatId,
          sender: 'agent',
          text: data.text,
          status: 'sent',
        })
        .select('id')
        .single();
      if (insertError) {
        console.error('Error guardando mensaje en BD:', insertError);
      }
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString(), unread_count: 0 })
        .eq('id', data.chatId);
      return {
        success: true,
        messageId: savedMessage?.id,
        status: 'sent',
      };
    }
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
 * Marca el chat como leído (resetea unread_count).
 * No actualizamos messages.read para evitar errores con triggers/updated_at.
 */
export async function markMessagesAsRead(chatId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No hay sesión' };

  try {
    const { error } = await supabase
      .from('chats')
      .update({ unread_count: 0 })
      .eq('id', chatId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error marcando chat como leído:', err);
    return { success: false, error: err.message };
  }
}
