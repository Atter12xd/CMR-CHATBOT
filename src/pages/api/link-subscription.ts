import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '');

export const POST: APIRoute = async ({ request }) => {
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
      JSON.stringify({ error: 'Configuración del servidor incorrecta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Sesión inválida' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { session_id?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const sessionId = body.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Falta session_id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    if (!session.subscription || !session.customer) {
      return new Response(
        JSON.stringify({ error: 'Sesión de pago no válida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionEmail = (typeof session.customer_email === 'string' ? session.customer_email : '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    if (sessionEmail && userEmail && sessionEmail !== userEmail) {
      return new Response(
        JSON.stringify({ error: 'La sesión de pago corresponde a otro correo. Regístrate con el correo que usaste en el pago.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

    const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Configuración del servidor incorrecta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    const orgId = orgs?.[0]?.id;
    if (!orgId) {
      return new Response(
        JSON.stringify({ error: 'No se encontró tu organización' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('stripe_subscriptions')
      .update({ organization_id: orgId, updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      const { data: existing } = await supabaseAdmin
        .from('stripe_subscriptions')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .limit(1)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('stripe_subscriptions')
          .update({ organization_id: orgId, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);
      } else {
        console.error('[link-subscription]', updateError);
        return new Response(
          JSON.stringify({ error: 'No se pudo vincular la suscripción. ¿Completaste el pago?' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[link-subscription]', err);
    return new Response(
      JSON.stringify({ error: 'Error al vincular suscripción' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
