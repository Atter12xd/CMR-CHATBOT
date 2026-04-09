/**
 * Misma lógica de ventas/IA que wazapp-baileys (events.ts generateAIResponse + pedidos).
 * Usa el cliente Supabase con service role pasado desde las API routes de Astro.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export type WebWidgetOrgConfig = {
  id: string;
  name: string;
  openai_api_key?: string | null;
};

async function createOrderInDb(
  db: SupabaseClient,
  organizationId: string,
  chatId: string,
  customerName: string,
  addressOrReference: string,
  items: { product_name: string; quantity: number; price: number }[],
  customerDni: string,
): Promise<string | null> {
  if (!items?.length) return null;
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const { data: lastOrder } = await db
    .from('orders')
    .select('code')
    .eq('organization_id', organizationId)
    .not('code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  const lastCode = (lastOrder as { code?: string } | null)?.code;
  if (lastCode) {
    const match = lastCode.match(/PED-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  const code = `PED-${String(nextNum).padStart(5, '0')}`;

  let customerPhone: string | null = null;
  const { data: chat } = await db.from('chats').select('customer_phone').eq('id', chatId).maybeSingle();
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
    code,
  };
  if (customerPhone !== null) orderPayload.customer_phone = customerPhone;

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert(orderPayload as never)
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[web-widget] Error creando pedido:', orderError);
    return null;
  }

  const orderId = (order as { id: string }).id;

  for (const item of items) {
    await db.from('order_items').insert({
      order_id: orderId,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    } as never);
  }

  return code;
}

async function getPaymentInstructionsForClient(
  db: SupabaseClient,
  organizationId: string,
): Promise<string> {
  try {
    const { data: paymentMethods } = await db
      .from('payment_methods_config')
      .select('method, account_name, account_number, account_type')
      .eq('organization_id', organizationId)
      .eq('enabled', true);
    if (!paymentMethods?.length) return '';
    const lines = paymentMethods.map((p: { method: string; account_name?: string | null; account_number?: string | null; account_type?: string | null }) => {
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

export async function generateWebWidgetSalesReply(
  db: SupabaseClient,
  clientConfig: WebWidgetOrgConfig,
  chatId: string,
  userMessage: string,
): Promise<string> {
  let botConfig: {
    company_name: string | null;
    company_description: string | null;
    initial_greeting: string | null;
    bot_name: string | null;
    catalog_invite: string | null;
    company_website_url: string | null;
  } | null = null;
  try {
    const { data } = await db
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
    const { data: contexts } = await db
      .from('bot_context')
      .select('context_text')
      .eq('organization_id', clientConfig.id)
      .order('priority', { ascending: false })
      .limit(10);
    contextText = contexts?.map((c) => c.context_text).join('\n\n') || '';
  } catch {
    //
  }

  const hasWebOrCatalog = contextText.length > 50;
  let webCatalogBlock = '';
  if (hasWebOrCatalog || companyWebsiteUrl) {
    const urlLine = companyWebsiteUrl
      ? `- URL de la web para ofrecer al cliente: ${companyWebsiteUrl}. Puedes decir "Puede ver nuestra web: ${companyWebsiteUrl}".`
      : '';
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

  const MAX_PRODUCTS_IN_PROMPT = 100;
  const MAX_DESC_CHARS = 140;

  let productsContext = 'No hay productos cargados';
  try {
    const { data: products } = await db
      .from('products')
      .select('name, description, price, category, image_url, stock, updated_at')
      .eq('organization_id', clientConfig.id)
      .order('updated_at', { ascending: false })
      .limit(MAX_PRODUCTS_IN_PROMPT);

    productsContext =
      products
        ?.map((p) => {
          const raw = (p.description || '').trim();
          const shortDesc =
            raw.length > MAX_DESC_CHARS ? `${raw.slice(0, MAX_DESC_CHARS)}…` : raw || 'Sin descripción';
          const stockPart =
            p.stock != null && Number.isFinite(Number(p.stock)) ? ` | Stock: ${p.stock}` : '';
          return `- ${p.name} [${p.category}]: ${shortDesc} — S/${p.price}${stockPart}${p.image_url ? ` | Imagen: ${p.image_url}` : ''}`;
        })
        .join('\n') || productsContext;

    if (products && products.length >= MAX_PRODUCTS_IN_PROMPT) {
      productsContext += `\n(Nota: hay al menos ${MAX_PRODUCTS_IN_PROMPT} productos en catálogo; prioriza coincidencias por nombre o categoría.)`;
    }
  } catch {
    //
  }

  let paymentMethodsContext = '';
  try {
    const { data: paymentMethods } = await db
      .from('payment_methods_config')
      .select('method, enabled, account_name, account_number, account_type')
      .eq('organization_id', clientConfig.id)
      .eq('enabled', true);
    if (paymentMethods?.length) {
      paymentMethodsContext =
        'MÉTODOS DE PAGO que debes ofrecer al cliente:\n' +
        paymentMethods
          .map((p: { method: string; account_name?: string | null; account_number?: string | null; account_type?: string | null }) => {
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
          })
          .filter(Boolean)
          .join('\n');
    }
  } catch {
    //
  }

  const { data: recentMessages } = await db
    .from('messages')
    .select('sender, text')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(10);

  const chatHistory =
    recentMessages
      ?.reverse()
      .map((m) => `${m.sender === 'user' ? 'Cliente' : 'Asistente'}: ${m.text}`)
      .join('\n') || '';

  const systemPrompt = `Eres un asistente de ventas de "${companyDisplay}". Hablas siempre en español, de forma amable, clara y elegante. Respuestas cortas (máximo 2-4 oraciones), salvo al dar listas.
${presentationBlock}

CONTEXTO DE LA EMPRESA (información de web o catálogo que entrenaron):
${contextText || '(Aún no hay web ni catálogo entrenado.)'}
${webCatalogBlock}

PRODUCTOS DISPONIBLES (catálogo del CRM; puede incluir productos sincronizados desde Shopify — usa solo esta lista, nombres y precios exactos):
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
    apiKey: clientConfig.openai_api_key || process.env.OPENAI_API_KEY || '',
  });

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'create_order',
        description:
          'Registra un pedido cuando el cliente confirma: nombre, DNI, dirección de envío y productos con cantidades y precios.',
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
                  price: { type: 'number', description: 'Precio unitario' },
                },
                required: ['product_name', 'quantity', 'price'],
              },
            },
          },
          required: ['customer_name', 'items'],
        },
      },
    },
  ];

  const oaMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const role: 'user' | 'assistant' = line.startsWith('Cliente:') ? 'user' : 'assistant';
        return { role, content: line.replace(/^(Cliente|Asistente): /, '') };
      }),
    { role: 'user', content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: oaMessages,
    tools,
    tool_choice: 'auto',
    max_tokens: 400,
    temperature: 0.7,
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
        let args: {
          customer_name: string;
          customer_dni?: string;
          address_or_reference?: string;
          items: { product_name: string; quantity: number; price: number }[];
        };
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          continue;
        }
        const orderCode = await createOrderInDb(
          db,
          clientConfig.id,
          chatId,
          args.customer_name,
          args.address_or_reference || '',
          args.items,
          args.customer_dni || '',
        );
        if (orderCode) {
          const paymentText = await getPaymentInstructionsForClient(db, clientConfig.id);
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
