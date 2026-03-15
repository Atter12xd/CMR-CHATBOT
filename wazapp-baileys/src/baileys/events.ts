import { WASocket, proto } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Obtiene el mensaje “interno” desenrollando viewOnce / ephemeral para detectar imagen/documento. */
function getContentMessage(m: proto.IMessage | null | undefined): proto.IMessage | null {
  if (!m) return null;
  const inner = (m as Record<string, unknown>).viewOnceMessage?.message
    ?? (m as Record<string, unknown>).viewOnceMessageV2?.message
    ?? (m as Record<string, unknown>).ephemeralMessage?.message;
  if (inner && typeof inner === 'object') return inner as proto.IMessage;
  return m;
}

function hasImageOrDocument(m: proto.IMessage | null): { hasImage: boolean; hasDocument: boolean; caption?: string } {
  if (!m) return { hasImage: false, hasDocument: false };
  const img = (m as Record<string, unknown>).imageMessage;
  const doc = (m as Record<string, unknown>).documentMessage;
  const hasImage = !!img;
  const hasDocument = !!doc;
  const caption = typeof img === 'object' && img !== null && 'caption' in img
    ? (img as { caption?: string }).caption
    : undefined;
  return { hasImage, hasDocument, caption };
}

export async function handleIncomingMessage(
  socket: WASocket,
  msg: proto.IWebMessageInfo,
  clientId: string
) {
  const remoteJid = msg.key.remoteJid!;
  if (remoteJid.endsWith('@g.us')) {
    return;
  }
  const senderPhone = remoteJid.replace('@s.whatsapp.net', '');
  const content = getContentMessage(msg.message ?? undefined);
  const { hasImage, hasDocument, caption } = hasImageOrDocument(content);
  const raw = msg.message ?? {};
  const messageText = (content?.conversation as string | undefined)
    || (content?.extendedTextMessage as { text?: string } | undefined)?.text
    || caption
    || (hasImage ? '[Captura de pago]' : '')
    || (hasDocument ? '[Documento/comprobante]' : '')
    || '';

  if (!messageText && !hasImage && !hasDocument) {
    const keys = Object.keys(raw).filter(k => (raw as Record<string, unknown>)[k] != null);
    console.log(`[CHAT] Mensaje ignorado (sin texto ni imagen/doc) de ${senderPhone}. Keys: ${keys.join(', ')}`);
    return;
  }

  const hasText = !!((content?.conversation as string | undefined) || (content?.extendedTextMessage as { text?: string } | undefined)?.text || caption);
  const isOnlyMediaComprobante = (hasImage || hasDocument) && !hasText;
  const displayText = messageText || (hasImage ? '[Imagen]' : '[Documento]');
  console.log(`[CHAT] Mensaje de ${senderPhone}: ${displayText}`);

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

    const userMessageText = messageText || (hasImage ? '[Captura de pago enviada]' : '[Documento/comprobante enviado]');
    await supabase.from('messages').insert({
      chat_id: chatId,
      sender: 'user',
      text: userMessageText,
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

    if (isOnlyMediaComprobante) {
      const comprobanteReply = 'Recibimos tu comprobante. Lo verificaremos y en breve te confirmamos tu pedido.';
      try {
        await registerPaymentReported(clientConfig.id, chatId);
        console.log(`[PAGO] Comprobante (imagen/doc) registrado por ${senderPhone} (chat ${chatId})`);
      } catch (e) {
        console.error('Error registrando comprobante:', e);
      }
      await socket.sendMessage(remoteJid, { text: comprobanteReply });
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender: 'bot',
        text: comprobanteReply,
        status: 'sent'
      });
      console.log(`[CHAT] Respuesta (comprobante) enviada a ${senderPhone}`);
      return;
    }

    if (hasImage || hasDocument) {
      try {
        await registerPaymentReported(clientConfig.id, chatId);
        console.log(`[PAGO] Comprobante con texto registrado por ${senderPhone} (chat ${chatId})`);
      } catch (e) {
        console.error('Error registrando comprobante:', e);
      }
    }

    try {
      await updateChatIntentIfBuying(chatId, messageText);
    } catch (e) {
      console.error('Error actualizando intención:', e);
    }

    const aiResponse = await generateAIResponse(clientConfig, chatId, messageText);

    if (isProductQuestion(messageText)) {
      await sendProductImages(socket, remoteJid, clientConfig.id, chatId);
    }

    await socket.sendMessage(remoteJid, { text: aiResponse });

    if (isPaymentReportMessage(messageText) && !hasImage && !hasDocument) {
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
  let botConfig: { company_name: string | null; company_description: string | null; initial_greeting: string | null; bot_name: string | null; catalog_invite: string | null; company_website_url: string | null } | null = null;
  try {
    const { data } = await supabase
      .from('organization_bot_config')
      .select('company_name, company_description, initial_greeting, bot_name, catalog_invite, company_website_url')
      .eq('organization_id', clientConfig.id)
      .maybeSingle();
    botConfig = data;
  } catch {
    //
  }

  const companyDisplay = (botConfig?.company_name?.trim() || clientConfig.name).trim();
  const botNameDisplay = (botConfig?.bot_name?.trim() || 'asistente').trim();
  const companyDesc = (botConfig?.company_description?.trim() || '').trim();
  const initialGreeting = (botConfig?.initial_greeting?.trim() || '').trim();
  const catalogInvitePhrase = (botConfig?.catalog_invite?.trim() || '').trim();
  const companyWebsiteUrl = (botConfig?.company_website_url?.trim() || '').trim();

  let presentationBlock = '';
  if (companyDisplay || botNameDisplay || companyDesc || initialGreeting) {
    presentationBlock = `
PRESENTACIÓN DEL BOT (úsala al saludar o cuando pregunten quién eres):
- Te llamas "${botNameDisplay}". Eres asistente de "${companyDisplay || clientConfig.name}".
${companyDesc ? `- La empresa se dedica a: ${companyDesc}.` : ''}
${initialGreeting ? `- Después de presentarte, ofrece: "${initialGreeting}"` : ''}
- Ejemplo de saludo: "Hola, soy ${botNameDisplay}, asistente de ${companyDisplay}. ${companyDesc ? `Nos dedicamos a ${companyDesc}. ` : ''}${initialGreeting || '¿En qué puedo ayudarte?'}"
`;
  }

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

  const hasWebOrCatalog = contextText.length > 50;
  let webCatalogBlock = '';
  if (hasWebOrCatalog || companyWebsiteUrl) {
    const urlLine = companyWebsiteUrl ? `- URL de la web para ofrecer al cliente: ${companyWebsiteUrl}. Puedes decir "Puede ver nuestra web: ${companyWebsiteUrl}".` : '';
    const inviteLine = catalogInvitePhrase
      ? `- Para invitar a ver web o catálogo di algo como: "${catalogInvitePhrase}".`
      : '- Si tienes información de web o PDF/catálogo entrenada, invita al cliente a ver la web o a que le pases el catálogo. Ej: "Puede ver nuestra web" o "¿Le paso el catálogo?" según lo que hayas entrenado.';
    webCatalogBlock = `
INVITAR A VER WEB O CATÁLOGO:
${urlLine}
${inviteLine}
- Después invita a elegir: "Si le gusta algún producto, dime el nombre y la talla (si aplica) y hacemos el pedido."
`;
  }

  const orderFlowBlock = `
CÓMO TOMAR PEDIDOS (elegante y claro):
- Pide al cliente que indique el nombre del producto y la talla (o variante) si aplica. Luego pide nombre completo, DNI y dirección de entrega.
- Cuando tengas nombre, DNI, dirección y productos, usa create_order. Tras crear el pedido, indica al cliente que debe realizar el pago (con los métodos de la lista: Yape/Plin/BCP, nombre y número) y que cuando envíe el comprobante lo verificaremos y le confirmaremos. No digas que el pedido ya está registrado/confirmado hasta que el cliente haya pagado y nosotros lo verifiquemos.
- Mantén un tono cercano pero profesional. No inventes productos ni precios; usa solo la lista de PRODUCTOS DISPONIBLES.
`;

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

  const systemPrompt = `Eres un asistente de ventas de "${companyDisplay}". Hablas siempre en español, de forma amable, clara y elegante. Respuestas cortas (máximo 2-4 oraciones), salvo al dar listas.
${presentationBlock}

CONTEXTO DE LA EMPRESA (información de web o catálogo que entrenaron):
${contextText || '(Aún no hay web ni catálogo entrenado.)'}
${webCatalogBlock}

PRODUCTOS DISPONIBLES (responde con nombre y precio; las fotos se envían por separado):
${productsContext}
${paymentMethodsContext ? `\n${paymentMethodsContext}\n` : ''}
${orderFlowBlock}

CÓMO HABLAR:
- Tono: amable, claro, profesional y cercano.
- Productos: responde con nombre y precio en S/. NO pongas enlaces de imagen; las fotos se envían aparte.
- Pagos: solo indica los métodos que aparecen en "MÉTODOS DE PAGO"; di el nombre y "a nombre de [nombre]". No inventes datos.

REGLAS:
- Responde solo en español. Máximo 2-4 oraciones salvo listas de productos o métodos de pago.
- Si no sabes algo, ofrece contactar con un agente.
- Pedidos: pide nombre completo, DNI, dirección de entrega y productos con cantidades. Cuando tengas todo, usa create_order. IMPORTANTE: Después de create_order NO digas "pedido registrado" ni "listo tu pedido está confirmado". Solo indica cómo debe pagar (Yape/Plin/BCP con nombre y número de la lista) y que al enviar el comprobante lo verificaremos y entonces le confirmaremos el pedido.
- Si el cliente dice que ya pagó o enviará comprobante, agradece y confirma que lo verificarán.`;

  const openai = new OpenAI({
    apiKey: clientConfig.openai_api_key || process.env.OPENAI_API_KEY || ''
  });

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'create_order',
        description: 'Registra un pedido cuando el cliente confirma: nombre, DNI, dirección de envío y productos con cantidades y precios.',
        parameters: {
          type: 'object',
          properties: {
            customer_name: { type: 'string', description: 'Nombre completo del cliente' },
            customer_dni: { type: 'string', description: 'DNI del cliente' },
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
        let args: { customer_name: string; customer_dni?: string; address_or_reference?: string; items: { product_name: string; quantity: number; price: number }[] };
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          continue;
        }
        const orderCode = await createOrderInDb(clientConfig.id, chatId, args.customer_name, args.address_or_reference || '', args.items, args.customer_dni || '');
        if (orderCode) {
          const paymentText = await getPaymentInstructionsForClient(clientConfig.id);
          const extra = paymentText
            ? `\n\nListo, ya tenemos tu pedido. Para confirmarlo realiza el pago por:\n\n${paymentText}\n\nCuando envíes el comprobante lo verificaremos y te confirmaremos. Tu código de pedido es **${orderCode}** (guárdalo).`
            : `\n\nListo, ya tenemos tu pedido. Cuando envíes el comprobante de pago lo verificaremos y te confirmaremos. Tu código de pedido es **${orderCode}** (guárdalo).`;
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
  items: { product_name: string; quantity: number; price: number }[],
  customerDni: string
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
    delivery_address: addressOrReference || null,
    customer_dni: customerDni || null,
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

async function getPaymentInstructionsForClient(organizationId: string): Promise<string> {
  try {
    const { data: paymentMethods } = await supabase
      .from('payment_methods_config')
      .select('method, account_name, account_number, account_type')
      .eq('organization_id', organizationId)
      .eq('enabled', true);
    if (!paymentMethods?.length) return '';
    const lines = paymentMethods.map(p => {
      if (p.method === 'yape' || p.method === 'plin') {
        const num = p.account_number?.trim();
        const name = p.account_name || 'N/A';
        const numText = num ? ` al número ${num}` : '';
        return `• ${p.method === 'yape' ? 'Yape' : 'Plin'}${numText}: a nombre de ${name}`;
      }
      if (p.method === 'bcp') {
        return `• BCP ${p.account_type || ''}: cuenta ${p.account_number || 'N/A'} - a nombre de ${p.account_name || 'N/A'}`;
      }
      return '';
    }).filter(Boolean);
    return lines.join('\n');
  } catch {
    return '';
  }
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

const PRODUCT_QUESTION_KEYWORDS = [
  'producto', 'productos', 'qué venden', 'que venden', 'catálogo', 'catalogo', 'qué tienen',
  'que tienen', 'precio', 'precios', 'cuánto cuesta', 'cuanto cuesta', 'cuánto es', 'cuanto es',
  'foto', 'fotos', 'imagen', 'ver', 'mostrar', 'tienen', 'venden', 'ofrecen', 'lista'
];

function isProductQuestion(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 2) return false;
  return PRODUCT_QUESTION_KEYWORDS.some(k => lower.includes(k));
}

async function sendProductImages(
  socket: WASocket,
  remoteJid: string,
  organizationId: string,
  chatId: string
): Promise<void> {
  const { data: products } = await supabase
    .from('products')
    .select('name, price, image_url')
    .eq('organization_id', organizationId)
    .not('image_url', 'is', null)
    .limit(5);

  if (!products?.length) return;

  for (const p of products) {
    const url = (p as { image_url: string }).image_url?.trim();
    if (!url) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const caption = `${p.name} - S/ ${Number(p.price)}`;
      await socket.sendMessage(remoteJid, { image: buffer, caption });

      await supabase.from('messages').insert({
        chat_id: chatId,
        sender: 'bot',
        text: caption,
        image_url: url,
        status: 'sent'
      });
    } catch (e) {
      console.error('Error enviando imagen de producto:', p.name, e);
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
