import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '');

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

    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || 'https://wazapp.ai';
    const successUrl = `${origin}/register?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/precios`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      allow_promotion_codes: true,
    });

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
