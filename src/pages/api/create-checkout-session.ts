import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '');

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no configurado');
  return createClient(url, key);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const priceId = import.meta.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_PRICE_ID no configurado. Añade en Vercel el Price ID del plan $50/mes.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : undefined;

    let trialDays = 14;
    if (email) {
      const supabase = getSupabase();
      const { data: excluded } = await supabase
        .from('stripe_trial_excluded')
        .select('id')
        .ilike('customer_email', email)
        .limit(1)
        .maybeSingle();
      if (excluded) trialDays = 0;
    }

    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || 'https://wazapp.ai';
    const successUrl = `${origin}/register?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/precios`;

    const sessionConfig: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : {},
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear sesión de pago';
    console.error('[Stripe create-checkout-session]', err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
