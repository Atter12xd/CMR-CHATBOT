import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '');

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Falta session_id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      const sub = session.subscription as Stripe.Subscription | null;
      const isTrialing = sub && (sub.status === 'trialing' || sub.status === 'active');
      if (!isTrialing) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Sesión no completada' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const customerEmail = typeof session.customer_email === 'string' ? session.customer_email : null;
    return new Response(
      JSON.stringify({ valid: true, email: customerEmail || undefined }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Stripe verify-session]', err);
    return new Response(
      JSON.stringify({ valid: false, error: 'Sesión inválida o expirada' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
