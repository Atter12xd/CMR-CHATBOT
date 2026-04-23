import { WASocket, proto } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Obtiene el mensaje "interno" desenrollando viewOnce / ephemeral para detectar imagen/documento. */
function getContentMessage(m: proto.IMessage | null | undefined): proto.IMessage | null {
  if (!m) return null;
  const r = m as Record<string, { message?: unknown } | undefined>;
  const v1 = r.viewOnceMessage;
  const v2 = r.viewOnceMessageV2;
  const v3 = r.ephemeralMessage;
  const inner = v1?.message ?? v2?.message ?? v3?.message;
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

    const imageMatches = await findProductsMentionedInMessage(clientConfig.id, messageText);
    if (imageMatches.length) {
      await sendProductImagesForProducts(socket, remoteJid, chatId, imageMatches);
    }

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

  const hasCatalogOutreach = !!(companyWebsiteUrl || catalogInvitePhrase);
  const showWebCatalogHints =
    hasCatalogOutreach || contextText.trim().length > 50;
  let webCatalogBlock = '';
  if (showWebCatalogHints) {
    const urlLine = companyWebsiteUrl
      ? `- URL oficial de la web (úsala en conversación cuando convenga): ${companyWebsiteUrl}. Ej.: "Puede ver todo aquí: ${companyWebsiteUrl}".`
      : '';
    const inviteLine = catalogInvitePhrase
      ? `- Frase o enlace de catálogo configurado por la tienda: "${catalogInvitePhrase}". Intégrala de forma natural al guiar al cliente.`
      : '- Si en el contexto entrenado hay PDF, Drive o catálogo online, menciónalo al cliente para que vea el surtido completo.';
    webCatalogBlock = `
WEB / CATÁLOGO (complemento a la lista interna):
${urlLine}
${inviteLine}
- El enlace sirve para fotos, tallas y colección completa. No lo uses como única respuesta si en PRODUCTOS DISPONIBLES ya hay filas que encajan con lo que preguntó el cliente (ver reglas de palabra clave abajo).
- Cuando convenga, pide el nombre exacto como en web o catálogo para el pedido (y talla si aplica).
`;
  }

  const catalogConfigMissingBlock = !hasCatalogOutreach
    ? `
CONFIGURACIÓN INCOMPLETA EN CMR: Falta tanto la URL de web como el texto/enlace de catálogo en la ficha del bot. No inventes enlaces. Pide disculpas breves y que un administrador complete «URL de tu web» o «Invitación a ver web o catálogo» en Entrenamiento del bot; ofrece hablar con un humano si necesita ayuda urgente.
`
    : '';

  const productDiscoveryBlock = `
PALABRAS CLAVE, TIPO O NOMBRE PARCIAL (ej.: "zapatilla", "zapatillas", "polo", "vestido", "yordan", una sola palabra o referencia corta):
- Primero revisa PRODUCTOS DISPONIBLES: busca coincidencias en nombre, categoría o descripción (ignora mayúsculas; trata singular/plural como equivalentes razonables, ej. zapatilla/zapatillas).
- Si hay una o más coincidencias: menciónalas con nombre exacto del listado y precio en S/. (hasta 8 si hace falta; si son muchas, las más relevantes y ofrece afinar). Pregunta cuál desea o si quiere más detalle.
- Si solo hay una coincidencia clara: preséntala como la opción que encaja ("Tenemos … a S/…") y ofrece seguir con el pedido o ver la web para fotos/tallas.
- Si no hay ninguna fila que encaje: entonces invita al catálogo/web con amabilidad y pide una referencia más concreta.
- No respondas únicamente con el enlace de la web cuando el listado interno ya contesta la duda.

CONSULTAS MUY ABIERTAS ("qué venden", "todo el catálogo", "qué productos tienen", "precios" sin tipo):
- Combina enlace o invitación a web/catálogo con 2–4 ejemplos breves de PRODUCTOS DISPONIBLES (no listas enormes).

PRODUCTO CONCRETO (nombre de modelo completo o casi):
- Confirma precio en S/. y stock si consta; si no está en la lista, dilo y ofrece alternativas.

PEDIDOS:
- El nombre para create_order debe ser el de PRODUCTOS DISPONIBLES; si el cliente usó una variante, confirma el nombre exacto de la fila antes de registrar.
`;

  const orderFlowBlock = `
CÓMO TOMAR PEDIDOS (elegante y claro):
- Pide al cliente el nombre del producto tal como en web o catálogo (o el de PRODUCTOS DISPONIBLES) y la talla o variante si aplica. Luego pide nombre completo, DNI y dirección de entrega.
- Cuando tengas nombre, DNI, dirección y productos, usa create_order. Tras crear el pedido, indica al cliente que debe realizar el pago (con los métodos de la lista: Yape/Plin/BCP, nombre y número) y que cuando envíe el comprobante lo verificaremos y le confirmaremos. No digas que el pedido ya está registrado/confirmado hasta que el cliente haya pagado y nosotros lo verifiquemos.
- Mantén un tono cercano pero profesional. No inventes productos ni precios; usa solo la lista de PRODUCTOS DISPONIBLES.
`;

  const MAX_PRODUCTS_IN_PROMPT = 100;
  const MAX_DESC_CHARS = 140;

  let productsContext = 'No hay productos cargados';
  try {
    const { data: products } = await supabase
      .from('products')
      .select('name, description, price, category, image_url, stock, updated_at')
      .eq('organization_id', clientConfig.id)
      .order('updated_at', { ascending: false })
      .limit(MAX_PRODUCTS_IN_PROMPT);

    productsContext =
      products?.map((p) => {
        const raw = (p.description || '').trim();
        const shortDesc =
          raw.length > MAX_DESC_CHARS ? `${raw.slice(0, MAX_DESC_CHARS)}…` : raw || 'Sin descripción';
        const stockPart =
          p.stock != null && Number.isFinite(Number(p.stock))
            ? ` | Stock: ${p.stock}`
            : '';
        return `- ${p.name} [${p.category}]: ${shortDesc} — S/${p.price}${stockPart}${p.image_url ? ` | Imagen: ${p.image_url}` : ''}`;
      }).join('\n') || productsContext;

    if (products && products.length >= MAX_PRODUCTS_IN_PROMPT) {
      productsContext += `\n(Nota: hay al menos ${MAX_PRODUCTS_IN_PROMPT} productos en catálogo; prioriza coincidencias por nombre, categoría, descripción y palabras clave del cliente.)`;
    }
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
${productDiscoveryBlock}
${catalogConfigMissingBlock}
PRODUCTOS DISPONIBLES (listado interno del CRM / Shopify; fuente de verdad de precios y de create_order — cruza con el nombre exacto que el cliente copie de web o catálogo):
${productsContext}
${paymentMethodsContext ? `\n${paymentMethodsContext}\n` : ''}
${orderFlowBlock}

CÓMO HABLAR:
- Tono: amable, claro, profesional y cercano.
- Productos: precios solo según PRODUCTOS DISPONIBLES. Comparte la URL de la web o del catálogo según la configuración del CMR. No pegues en el texto URLs sueltas de solo imagen del inventario: en WhatsApp, si el cliente menciona un producto concreto que coincida con la lista y tenga imagen, el sistema envía la foto **después** de tu mensaje de texto; tú solo confirma disponibilidad y precio.
- Pagos: solo indica los métodos que aparecen en "MÉTODOS DE PAGO"; di el nombre y "a nombre de [nombre]". No inventes datos.

REGLAS:
- Responde solo en español. Máximo 2-4 oraciones salvo listas de productos o métodos de pago.
- Si no sabes algo, ofrece contactar con un agente.
- Pedidos: pide nombre completo, DNI, dirección de entrega y productos con cantidades. Si aún faltan datos, guarda avance con upsert_order_draft. Si el cliente pide retomar, usa recover_order_draft. Cuando tengas todo, usa create_order. IMPORTANTE: Después de create_order NO digas "pedido registrado" ni "listo tu pedido está confirmado". Solo indica cómo debe pagar (Yape/Plin/BCP con nombre y número de la lista) y que al enviar el comprobante lo verificaremos y entonces le confirmaremos el pedido.
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
    },
    {
      type: 'function',
      function: {
        name: 'upsert_order_draft',
        description: 'Guarda/actualiza carrito en borrador cuando faltan datos para cerrar el pedido.',
        parameters: {
          type: 'object',
          properties: {
            customer_name: { type: 'string' },
            customer_dni: { type: 'string' },
            address_or_reference: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_name: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' }
                },
                required: ['product_name', 'quantity', 'price']
              }
            }
          }
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'recover_order_draft',
        description: 'Recupera el borrador de pedido activo de este chat para continuar.',
        parameters: { type: 'object', properties: {} }
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
      if (tc.type !== 'function') continue;
      const fn = tc.function;
      if (fn?.name === 'create_order') {
        let args: { customer_name: string; customer_dni?: string; address_or_reference?: string; items: { product_name: string; quantity: number; price: number }[] };
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          continue;
        }
        const orderCode = await createOrderInDb(clientConfig.id, chatId, args.customer_name, args.address_or_reference || '', args.items, args.customer_dni || '');
        if (orderCode) {
          await supabase
            .from('order_drafts')
            .update({ status: 'converted', updated_at: new Date().toISOString() })
            .eq('organization_id', clientConfig.id)
            .eq('chat_id', chatId)
            .in('status', ['draft', 'ready']);
          const paymentText = await getPaymentInstructionsForClient(clientConfig.id);
          const extra = paymentText
            ? `\n\nListo, ya tenemos tu pedido. Para confirmarlo realiza el pago por:\n\n${paymentText}\n\nCuando envíes el comprobante lo verificaremos y te confirmaremos. Tu código de pedido es **${orderCode}** (guárdalo).`
            : `\n\nListo, ya tenemos tu pedido. Cuando envíes el comprobante de pago lo verificaremos y te confirmaremos. Tu código de pedido es **${orderCode}** (guárdalo).`;
          return (msg.content || '').trim() + extra;
        }
      } else if (fn?.name === 'upsert_order_draft') {
        let args: { customer_name?: string; customer_dni?: string; address_or_reference?: string; items?: { product_name: string; quantity: number; price: number }[] };
        try {
          args = JSON.parse(fn.arguments || '{}');
        } catch {
          continue;
        }
        const saved = await upsertOrderDraftInDb(clientConfig.id, chatId, args);
        if (saved.ok) {
          return 'Perfecto, dejé guardado tu carrito en borrador. Cuando quieras seguimos y lo cerramos en un minuto.';
        }
      } else if (fn?.name === 'recover_order_draft') {
        const draft = await getLatestDraftSummary(clientConfig.id, chatId);
        if (!draft.hasDraft) {
          return 'No encuentro un carrito pendiente en este chat. Si quieres, armamos uno nuevo ahora.';
        }
        return `Te comparto tu borrador guardado:\n\n${draft.summary}\n\n¿Confirmamos estos datos o deseas ajustar algo?`;
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

async function upsertOrderDraftInDb(
  organizationId: string,
  chatId: string,
  payload: {
    customer_name?: string;
    customer_dni?: string;
    address_or_reference?: string;
    items?: { product_name: string; quantity: number; price: number }[];
  }
): Promise<{ ok: boolean; status: 'draft' | 'ready'; draftId?: string }> {
  const items = (payload.items || [])
    .filter((i) => i.product_name && i.quantity > 0)
    .map((i) => ({ product_name: i.product_name, quantity: i.quantity, price: i.price }));
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const status: 'draft' | 'ready' =
    (payload.customer_name || '').trim().length > 0 && items.length > 0 ? 'ready' : 'draft';

  const { data: existing } = await supabase
    .from('order_drafts')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('chat_id', chatId)
    .in('status', ['draft', 'ready'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let draftId = existing?.id as string | undefined;
  if (!draftId) {
    const { data: created } = await supabase
      .from('order_drafts')
      .insert({
        organization_id: organizationId,
        chat_id: chatId,
        customer_name: payload.customer_name || null,
        customer_dni: payload.customer_dni || null,
        address_or_reference: payload.address_or_reference || null,
        status,
        source: 'whatsapp',
        subtotal,
        currency: 'PEN',
        last_agent_action_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();
    draftId = created?.id;
  } else {
    await supabase
      .from('order_drafts')
      .update({
        customer_name: payload.customer_name || null,
        customer_dni: payload.customer_dni || null,
        address_or_reference: payload.address_or_reference || null,
        status,
        subtotal,
        last_agent_action_at: new Date().toISOString(),
      })
      .eq('id', draftId);
  }

  if (!draftId) return { ok: false, status };
  if (items.length > 0) {
    await supabase.from('order_draft_items').delete().eq('draft_id', draftId);
    await supabase.from('order_draft_items').insert(
      items.map((i) => ({
        draft_id: draftId,
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
      }))
    );
  }
  return { ok: true, status, draftId };
}

async function getLatestDraftSummary(
  organizationId: string,
  chatId: string
): Promise<{ hasDraft: boolean; summary: string }> {
  const { data: draft } = await supabase
    .from('order_drafts')
    .select('id, customer_name, customer_dni, address_or_reference, status, subtotal')
    .eq('organization_id', organizationId)
    .eq('chat_id', chatId)
    .in('status', ['draft', 'ready'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!draft) return { hasDraft: false, summary: 'No hay borrador activo.' };
  const { data: items } = await supabase
    .from('order_draft_items')
    .select('product_name, quantity, price')
    .eq('draft_id', draft.id)
    .limit(20);
  const lines = (items || []).map((i) => `- ${i.product_name} x${i.quantity} (S/ ${Number(i.price).toFixed(2)})`);
  const summary = [
    `Estado: ${draft.status === 'ready' ? 'listo para confirmar' : 'en progreso'}`,
    `Cliente: ${draft.customer_name || 'pendiente'}`,
    `DNI: ${draft.customer_dni || 'pendiente'}`,
    `Dirección: ${draft.address_or_reference || 'pendiente'}`,
    `Subtotal: S/ ${Number(draft.subtotal || 0).toFixed(2)}`,
    lines.length ? `Items:\n${lines.join('\n')}` : 'Items: pendientes',
  ].join('\n');

  return { hasDraft: true, summary };
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

const PRODUCT_MATCH_STOPWORDS = new Set([
  'para',
  'talla',
  'tallas',
  'color',
  'modelo',
  'marca',
  'nuevo',
  'nueva',
  'stock',
  'unica',
  'única',
]);

/** Mensaje en minúsculas con espacios; añade singular si la palabra del cliente termina en -s (p. ej. zapatillas → zapatilla). */
function normalizeMessageForProductMatch(text: string): string {
  const base = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const parts = base.split(/\s+/).filter(Boolean);
  const extras: string[] = [];
  for (const w of parts) {
    if (w.length >= 5 && w.endsWith('s') && !w.endsWith('ss')) {
      extras.push(w.slice(0, -1));
    }
  }
  const joined = [base, ...extras].join(' ');
  return ` ${joined.replace(/\s+/g, ' ')} `;
}

/** Tokens útiles del nombre de producto (≥4 letras) + variante sin -s final para cruzar con plural del cliente. */
function productNameMatchTokens(productName: string): string[] {
  const n = productName
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/gi, ' ')
    .trim();
  const words = n.split(/\s+/).filter((w) => w.length >= 4 && !PRODUCT_MATCH_STOPWORDS.has(w));
  const out: string[] = [];
  for (const w of words) {
    out.push(w);
    if (w.length >= 5 && w.endsWith('s') && !w.endsWith('ss')) {
      out.push(w.slice(0, -1));
    }
    if (w.length >= 5 && !w.endsWith('s')) {
      out.push(`${w}s`);
    }
  }
  return [...new Set(out)];
}

function scoreProductAgainstMessage(productName: string, hay: string): number {
  const name = String(productName || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 2) return 0;
  const n = name.toLowerCase();
  if (hay.includes(` ${n} `)) {
    return 5000 + n.length;
  }
  let best = 0;
  for (const t of productNameMatchTokens(name)) {
    if (hay.includes(` ${t} `)) {
      best = Math.max(best, 200 + t.length);
    }
  }
  return best;
}

/**
 * Productos cuya imagen enviar: nombre completo en el mensaje, o palabra clave del nombre (ej. "zapatilla" → "Zapatilla Yordan").
 */
async function findProductsMentionedInMessage(
  organizationId: string,
  text: string
): Promise<{ name: string; price: number; image_url: string }[]> {
  const { data: products } = await supabase
    .from('products')
    .select('name, price, image_url')
    .eq('organization_id', organizationId)
    .not('image_url', 'is', null)
    .limit(300);

  if (!products?.length) return [];

  const hay = normalizeMessageForProductMatch(text);
  const scored = products
    .map((p) => {
      const name = String(p.name || '')
        .replace(/\s+/g, ' ')
        .trim();
      const url = String((p as { image_url?: string }).image_url || '').trim();
      if (!name || !url) return null;
      const score = scoreProductAgainstMessage(name, hay);
      if (score <= 0) return null;
      return { name, price: Number(p.price) || 0, image_url: url, score };
    })
    .filter((x): x is { name: string; price: number; image_url: string; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || b.name.length - a.name.length);

  const out: { name: string; price: number; image_url: string }[] = [];
  const seen = new Set<string>();
  for (const row of scored) {
    const key = row.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: row.name, price: row.price, image_url: row.image_url });
    if (out.length >= 5) break;
  }
  return out;
}

async function sendProductImagesForProducts(
  socket: WASocket,
  remoteJid: string,
  chatId: string,
  products: { name: string; price: number; image_url: string }[]
): Promise<void> {
  for (const p of products) {
    const url = p.image_url?.trim();
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
