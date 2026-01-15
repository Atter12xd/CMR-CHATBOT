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

/**
 * Envía un mensaje de texto a WhatsApp
 */
export async function sendTextMessage(
  data: SendTextMessageRequest
): Promise<SendMessageResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-send-message', {
      body: {
        chatId: data.chatId,
        text: data.text,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error enviando mensaje:', error);
      return {
        success: false,
        status: 'failed',
        error: error.message || 'Error al enviar mensaje',
      };
    }

    return {
      success: true,
      messageId: result?.messageId,
      whatsappMessageId: result?.whatsappMessageId,
      status: result?.status || 'sent',
    };
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
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-send-message', {
      body: {
        chatId: data.chatId,
        imageUrl: data.imageUrl,
        text: data.caption,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error enviando imagen:', error);
      return {
        success: false,
        status: 'failed',
        error: error.message || 'Error al enviar imagen',
      };
    }

    return {
      success: true,
      messageId: result?.messageId,
      whatsappMessageId: result?.whatsappMessageId,
      status: result?.status || 'sent',
    };
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
    throw new Error('No hay sesión activa');
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-send-message', {
      body: {
        chatId: data.chatId,
        documentUrl: data.documentUrl,
        filename: data.filename,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error enviando documento:', error);
      return {
        success: false,
        status: 'failed',
        error: error.message || 'Error al enviar documento',
      };
    }

    return {
      success: true,
      messageId: result?.messageId,
      whatsappMessageId: result?.whatsappMessageId,
      status: result?.status || 'sent',
    };
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
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('sender_type', 'user')
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
    throw err;
  }
}
