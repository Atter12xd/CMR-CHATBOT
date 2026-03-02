import { WASocket, proto } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handleIncomingMessage(
  socket: WASocket,
  msg: proto.IWebMessageInfo,
  clientId: string
) {
  const remoteJid = msg.key.remoteJid!;
  const senderPhone = remoteJid.replace('@s.whatsapp.net', '');
  const messageText = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || '';

  if (!messageText) return;

  console.log(`Mensaje de ${senderPhone}: ${messageText}`);

  try {
    const { data: clientConfig } = await supabase
      .from('organizations')
      .select('id, name, openai_api_key')
      .eq('id', clientId)
      .single();

    if (!clientConfig) {
      console.log('Organización no encontrada:', clientId);
      return;
    }

    const chatId = await getOrCreateChat(clientConfig.id, senderPhone, msg);

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'user',
      text: messageText,
      platform_message_id: msg.key.id,
      status: 'delivered'
    });

    const aiResponse = await generateAIResponse(clientConfig, chatId, messageText);

    await socket.sendMessage(remoteJid, { text: aiResponse });

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'bot',
      text: aiResponse,
      status: 'sent'
    });

    console.log(`Respuesta enviada a ${senderPhone}`);
  } catch (error) {
    console.error('Error procesando mensaje:', error);
  }
}

async function getOrCreateChat(
  organizationId: string,
  customerPhone: string,
  msg: proto.IWebMessageInfo
): Promise<string> {
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id, unread_count')
    .eq('organization_id', organizationId)
    .eq('customer_phone', customerPhone)
    .single();

  if (existingChat) {
    await supabase
      .from('chats')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: (existingChat.unread_count ?? 0) + 1
      })
      .eq('id', existingChat.id);
    return existingChat.id;
  }

  const pushName = msg.pushName || `Usuario ${customerPhone.slice(-4)}`;

  const { data: newChat } = await supabase
    .from('chats')
    .insert({
      organization_id: organizationId,
      customer_name: pushName,
      customer_phone: customerPhone,
      platform: 'whatsapp',
      status: 'active',
      last_message_at: new Date().toISOString()
    })
    .select('id')
    .single();

  return newChat!.id;
}

async function generateAIResponse(
  clientConfig: { id: string; name: string; openai_api_key?: string | null },
  chatId: string,
  userMessage: string
): Promise<string> {
  let contextText = '';
  try {
    const { data: contexts } = await supabase
      .from('bot_context')
      .select('context_text')
      .eq('organization_id', clientConfig.id)
      .order('priority', { ascending: false })
      .limit(10);
    contextText = contexts?.map(c => c.context_text).join('\n\n') || '';
  } catch {
    // tabla puede no existir
  }

  let productsContext = 'No hay productos cargados';
  try {
    const { data: products } = await supabase
      .from('products')
      .select('name, description, price, category')
      .eq('organization_id', clientConfig.id)
      .limit(20);
    productsContext = products?.map(p =>
      `- ${p.name}: ${p.description || 'Sin descripción'} - S/${p.price}`
    ).join('\n') || productsContext;
  } catch {
    //
  }

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('sender_type, text')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(10);

  const chatHistory = recentMessages?.reverse().map(m =>
    `${m.sender_type === 'user' ? 'Cliente' : 'Asistente'}: ${m.text}`
  ).join('\n') || '';

  const systemPrompt = `Eres un asistente de ventas de "${clientConfig.name}".

CONTEXTO:
${contextText}

PRODUCTOS:
${productsContext}

REGLAS:
- Responde en español
- Sé amable y conciso (máximo 2-3 oraciones)
- Si no sabes algo, ofrece contactar con un agente
- Sugiere productos cuando sea apropiado`;

  const openai = new OpenAI({
    apiKey: clientConfig.openai_api_key || process.env.OPENAI_API_KEY || ''
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...chatHistory.split('\n').filter(Boolean).map(line => {
        const role: 'user' | 'assistant' = line.startsWith('Cliente:') ? 'user' : 'assistant';
        return { role, content: line.replace(/^(Cliente|Asistente): /, '') };
      }),
      { role: 'user', content: userMessage }
    ],
    max_tokens: 300,
    temperature: 0.7
  });

  return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
}
