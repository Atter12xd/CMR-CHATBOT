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

  console.log(`[CHAT] Mensaje de ${senderPhone}: ${messageText}`);

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

    const chatId = await getOrCreateChat(clientConfig.id, senderPhone, remoteJid, msg);

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender: 'user',
      text: messageText,
      platform_message_id: msg.key.id,
      status: 'delivered'
    });

    const { data: chatRow } = await supabase
      .from('chats')
      .select('bot_active')
      .eq('id', chatId)
      .single();

    if (chatRow?.bot_active === false) {
      console.log(`[CHAT] Modo humano: bot pausado para ${senderPhone}, no se envía respuesta`);
      return;
    }

    try {
      await updateChatIntentIfBuying(chatId, messageText);
    } catch (e) {
      console.error('Error actualizando intención:', e);
    }

    const aiResponse = await generateAIResponse(clientConfig, chatId, messageText);

    await socket.sendMessage(remoteJid, { text: aiResponse });

    if (isPaymentReportMessage(messageText)) {
      try {
        await registerPaymentReported(clientConfig.id, chatId);
        console.log(`[PAGO] Registrado pago reportado por ${senderPhone} (chat ${chatId})`);
      } catch (e) {
        console.error('Error registrando pago reportado:', e);
      }
    }

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender: 'bot',
      text: aiResponse,
      status: 'sent'
    });

    console.log(`[CHAT] Respuesta enviada a ${senderPhone} | ${aiResponse.length > 60 ? aiResponse.slice(0, 60) + '...' : aiResponse}`);
  } catch (error) {
    console.error('Error procesando mensaje:', error);
  }
}

async function getOrCreateChat(
  organizationId: string,
  customerPhone: string,
  remoteJid: string,
  msg: proto.IWebMessageInfo
): Promise<string> {
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id, unread_count')
    .eq('organization_id', organizationId)
    .eq('customer_phone', customerPhone)
    .maybeSingle();

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
      platform_conversation_id: remoteJid,
      status: 'active',
      bot_active: true,
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
      .select('name, description, price, category, image_url')
      .eq('organization_id', clientConfig.id)
      .limit(20);
    productsContext = products?.map(p =>
      `- ${p.name}: ${p.description || 'Sin descripción'} - S/${p.price}${p.image_url ? ` | Imagen: ${p.image_url}` : ''}`
    ).join('\n') || productsContext;
  } catch {
    //
  }

  let paymentMethodsContext = '';
  try {
    const { data: paymentMethods } = await supabase
      .from('payment_methods_config')
      .select('method, enabled, account_name, account_number, account_type')
      .eq('organization_id', clientConfig.id)
      .eq('enabled', true);
    if (paymentMethods?.length) {
      paymentMethodsContext = 'MÉTODOS DE PAGO que debes ofrecer al cliente:\n' + paymentMethods.map(p => {
        if (p.method === 'yape' || p.method === 'plin') {
          const num = p.account_number?.trim();
          const name = p.account_name || 'N/A';
          const numText = num ? ` al número ${num}` : '';
          return `- ${p.method === 'yape' ? 'Yape' : 'Plin'}${numText}: A nombre de ${name}`;
        }
        if (p.method === 'bcp') {
          return `- BCP ${p.account_type || ''}: cuenta ${p.account_number || 'N/A'} - A nombre de ${p.account_name || 'N/A'}`;
        }
        return '';
      }).filter(Boolean).join('\n');
    }
  } catch {
    //
  }

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('sender, text')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(10);

  const chatHistory = recentMessages?.reverse().map(m =>
    `${m.sender === 'user' ? 'Cliente' : 'Asistente'}: ${m.text}`
  ).join('\n') || '';

  const systemPrompt = `Eres un asistente de ventas de "${clientConfig.name}". Hablas siempre en español, de forma amable y cercana. Respuestas cortas (máximo 2-4 oraciones).

CONTEXTO DE LA EMPRESA:
${contextText}

PRODUCTOS DISPONIBLES (usa solo esta lista; si hay URL de imagen, menciónala):
${productsContext}
${paymentMethodsContext ? `\n${paymentMethodsContext}\n` : ''}

CÓMO HABLAR:
- Tono: amable, claro, profesional pero cercano.
- Productos: cuando pregunten por productos, responde con nombre, precio en S/ y, si en la lista hay "Imagen: [URL]", di que pueden ver la foto en ese enlace.
- Pagos: Yape y Plin son pagos por celular; BCP es transferencia o depósito. Solo indica los métodos que aparecen arriba en "MÉTODOS DE PAGO"; di exactamente el nombre y "a nombre de [nombre]". No inventes datos de pago.
- Si preguntan "¿cómo pago?" o "¿Yape?", responde solo con los métodos de la lista con su nombre y a nombre de quién (o número de cuenta para BCP).

REGLAS:
- Responde solo en español. Máximo 2-4 oraciones salvo que pidan lista de productos o métodos de pago.
- Si no sabes algo, ofrece contactar con un agente.
- Sugiere productos cuando sea apropiado.
- Pedidos: cuando el cliente confirme un pedido (nombre, dirección, productos con cantidades y precios de la lista), usa la herramienta create_order y luego informa el código de pedido.
- Si el cliente dice que ya pagó o que enviará comprobante, agradece brevemente y confirma que lo verificarán.`;

  const openai = new OpenAI({
    apiKey: clientConfig.openai_api_key || process.env.OPENAI_API_KEY || ''
  });

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'create_order',
        description: 'Registra un pedido cuando el cliente confirma: nombre, dirección/referencia y productos con cantidades y precios.',
        parameters: {
          type: 'object',
          properties: {
            customer_name: { type: 'string', description: 'Nombre del cliente' },
            address_or_reference: { type: 'string', description: 'Dirección de envío o referencia' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_name: { type: 'string' },
                  quantity: { type: 'integer', description: 'Cantidad' },
                  price: { type: 'number', description: 'Precio unitario' }
                },
                required: ['product_name', 'quantity', 'price']
              }
            }
          },
          required: ['customer_name', 'items']
        }
      }
    }
  ];

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.split('\n').filter(Boolean).map(line => {
      const role: 'user' | 'assistant' = line.startsWith('Cliente:') ? 'user' : 'assistant';
      return { role, content: line.replace(/^(Cliente|Asistente): /, '') };
    }),
    { role: 'user', content: userMessage }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools,
    tool_choice: 'auto',
    max_tokens: 400,
    temperature: 0.7
  });

  const choice = completion.choices[0];
  const msg = choice?.message;
  if (!msg) return 'Lo siento, no pude procesar tu mensaje.';

  const toolCalls = msg.tool_calls;
  if (toolCalls?.length) {
    for (const tc of toolCalls) {
      if (tc.function?.name === 'create_order') {
        let args: { customer_name: string; address_or_reference?: string; items: { product_name: string; quantity: number; price: number }[] };
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          continue;
        }
        const orderCode = await createOrderInDb(clientConfig.id, chatId, args.customer_name, args.address_or_reference || '', args.items);
        if (orderCode) {
          const extra = `\n\n✅ Pedido registrado. Tu código de pedido es: **${orderCode}**. Guárdalo para seguimiento.`;
          return (msg.content || '').trim() + extra;
        }
      }
    }
  }

  return msg.content || 'Lo siento, no pude procesar tu mensaje.';
}

async function createOrderInDb(
  organizationId: string,
  chatId: string,
  customerName: string,
  addressOrReference: string,
  items: { product_name: string; quantity: number; price: number }[]
): Promise<string | null> {
  if (!items?.length) return null;
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const { data: lastOrder } = await supabase
    .from('orders')
    .select('code')
    .eq('organization_id', organizationId)
    .not('code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  if (lastOrder?.code) {
    const match = lastOrder.code.match(/PED-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  const code = `PED-${String(nextNum).padStart(5, '0')}`;

  let customerPhone: string | null = null;
  const { data: chat } = await supabase.from('chats').select('customer_phone').eq('id', chatId).maybeSingle();
  if (chat?.customer_phone) customerPhone = chat.customer_phone;

  const orderPayload: Record<string, unknown> = {
    organization_id: organizationId,
    chat_id: chatId,
    customer_name: customerName,
    customer_email: null,
    total: Math.round(total * 100) / 100,
    status: 'pending',
    code
  };
  if (customerPhone !== null) orderPayload.customer_phone = customerPhone;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creando pedido:', orderError);
    return null;
  }

  for (const item of items) {
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    });
  }

  return code;
}

const BUYING_INTENT_KEYWORDS: { pattern: RegExp | string; intent: string }[] = [
  { pattern: /cuánto es|cuanto es|cuánto sale|precio|cuánto (cuesta|vale)/i, intent: 'preguntando_precio' },
  { pattern: /lo tomo|lo quiero|quiero (ese|este)|me lo llevo|me lo reservas|reservame/i, intent: 'quiero_comprar' },
  { pattern: /cómo pago|como pago|dónde pago|donde pago|yape|plin|transferencia/i, intent: 'cómo_pago' },
  { pattern: /hacer (pedido|orden)|quiero pedir|hacer una orden/i, intent: 'hacer_pedido' }
];

async function updateChatIntentIfBuying(chatId: string, text: string): Promise<void> {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return;
  for (const { pattern, intent } of BUYING_INTENT_KEYWORDS) {
    const match = typeof pattern === 'string' ? lower.includes(pattern) : pattern.test(lower);
    if (match) {
      await supabase
        .from('chats')
        .update({
          last_intent: intent,
          last_intent_at: new Date().toISOString()
        })
        .eq('id', chatId);
      console.log(`[LEAD] Intención "${intent}" registrada en chat ${chatId}`);
      return;
    }
  }
}

const PAYMENT_REPORT_KEYWORDS = [
  'ya pagué', 'ya pague', 'te envío el comprobante', 'aqui está el comprobante',
  'listo ya transferí', 'listo transferi', 'comprobante', 'ya deposité', 'ya deposite',
  'ya hice el pago', 'acabo de pagar', 'envié el yape', 'envie el yape'
];

function isPaymentReportMessage(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return false;
  return PAYMENT_REPORT_KEYWORDS.some(k => lower.includes(k));
}

async function registerPaymentReported(organizationId: string, chatId: string): Promise<void> {
  const { data: chat } = await supabase
    .from('chats')
    .select('customer_name')
    .eq('id', chatId)
    .single();

  const customerName = chat?.customer_name || 'Cliente';

  const { data: lastOrder } = await supabase
    .from('orders')
    .select('id, total')
    .eq('chat_id', chatId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const amount = lastOrder?.total != null ? Number(lastOrder.total) : 0;

  await supabase.from('payments').insert({
    organization_id: organizationId,
    chat_id: chatId,
    customer_name: customerName,
    amount,
    method: 'otro',
    status: 'pending',
    notes: 'Pago reportado por el cliente por WhatsApp. Verificar comprobante.'
  });

  if (lastOrder?.id) {
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', lastOrder.id);
  }
}
