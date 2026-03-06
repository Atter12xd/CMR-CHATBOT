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
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta' }),
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

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: orgs } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);
  const orgId = orgs?.[0]?.id;
  if (!orgId) {
    return new Response(
      JSON.stringify({ error: 'Organización no encontrada' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data: sub } = await supabaseAdmin
    .from('stripe_subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', orgId)
    .in('status', ['trialing', 'active'])
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return new Response(
      JSON.stringify({ error: 'No hay suscripción activa para gestionar' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || 'https://wazapp.ai';
  const returnUrl = `${origin}/configuracion`;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl,
    });
    return new Response(
      JSON.stringify({ url: portalSession.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al abrir el portal de facturación';
    console.error('[create-billing-portal-session]', err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
