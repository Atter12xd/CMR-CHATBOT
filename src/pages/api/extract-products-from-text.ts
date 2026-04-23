import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const openaiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';

function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no configurado');
  return createClient(url, key);
}

export const POST: APIRoute = async ({ request }) => {
  if (!openaiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY no configurado' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    return new Response(
      JSON.stringify({ error: 'Configuración incorrecta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Sesión inválida' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { content?: string; organizationId?: string; sourceRef?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId.trim() : '';
  const sourceRef = typeof body?.sourceRef === 'string' ? body.sourceRef.trim() : 'Web';

  if (!content || content.length < 100) {
    return new Response(
      JSON.stringify({ error: 'Envía "content" con el texto extraído de la web (mínimo 100 caracteres)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (!organizationId) {
    return new Response(
      JSON.stringify({ error: 'Falta organizationId' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!org) {
    return new Response(
      JSON.stringify({ error: 'No tienes acceso a esta organización' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const truncated = content.slice(0, 12000);

  const systemPrompt = `Eres un asistente que extrae listas de productos de textos de páginas web, PDFs o catálogos.
Devuelve ÚNICAMENTE un JSON válido: un array de objetos. Cada objeto debe tener:
- "name": string (nombre del producto)
- "price": number (precio numérico; si hay varios precios usa el principal; si no hay precio usa 0)
- "description": string opcional (breve descripción)
- "category": string opcional (ej. Ropa, Electrónica, Hogar, Deportes, Libros, Juguetes, Belleza, Alimentos, Otros; si no sabes usa "Otros")
No devuelvas nada más que el JSON. Si no encuentras productos, devuelve [].`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extrae todos los productos que encuentres en este texto:\n\n${truncated}` },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '[]';
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '[]';
    let items: { name?: string; price?: number; description?: string; category?: string }[] = [];
    try {
      items = JSON.parse(jsonStr);
    } catch {
      return new Response(
        JSON.stringify({ error: 'No se pudo interpretar la respuesta de la IA', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(items)) items = [];
    const categories = ['Ropa', 'Electrónica', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Belleza', 'Alimentos', 'Otros'];
    let inserted = 0;
    for (const item of items) {
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      if (!name) continue;
      const price = typeof item.price === 'number' && item.price >= 0 ? item.price : 0;
      const description = typeof item.description === 'string' ? item.description.trim().slice(0, 500) : null;
      const category = typeof item.category === 'string' && categories.includes(item.category) ? item.category : 'Otros';

      const { error: insertErr } = await supabaseAdmin.from('product_suggestions').insert({
        organization_id: organizationId,
        name,
        description,
        price,
        category,
        source_ref: sourceRef,
        status: 'pending',
      });
      if (!insertErr) inserted++;
    }

    return new Response(
      JSON.stringify({
        count: inserted,
        message: inserted
          ? `Se encontraron ${inserted} productos. Revísalos en Productos → Sugeridos (web o catálogo).`
          : 'No se encontraron productos en el texto.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al extraer productos';
    console.error('[extract-products-from-text]', err);
    return new Response(
      JSON.stringify({ error: message, count: 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
