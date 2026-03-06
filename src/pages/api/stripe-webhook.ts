import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no configurado');
  return createClient(url, key);
}

export const POST: APIRoute = async ({ request }) => {
  if (!webhookSecret) {
    console.error('[Stripe webhook] STRIPE_WEBHOOK_SECRET no configurado');
    return new Response('Webhook secret missing', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature') || '';
  let payload: string;
  try {
    payload = await request.text();
  } catch {
    return new Response('Invalid body', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Stripe webhook] Firma inválida:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription || !session.customer) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ['items.data.price'] });
        const status = sub.status === 'trialing' ? 'trialing' : sub.status === 'active' ? 'active' : 'incomplete';
        const customerEmail = typeof session.customer_email === 'string' ? session.customer_email : (session.customer as Stripe.Customer).email || '';

        await supabase.from('stripe_subscriptions').upsert(
          {
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer.id,
            stripe_subscription_id: sub.id,
            customer_email: customerEmail,
            status,
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        );
        console.log('[Stripe webhook] checkout.session.completed → subscription guardada:', sub.id);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === 'canceled' || sub.status === 'unpaid' ? 'canceled' : sub.status === 'trialing' ? 'trialing' : sub.status === 'active' ? 'active' : 'past_due';

        await supabase
          .from('stripe_subscriptions')
          .update({
            status,
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        console.log('[Stripe webhook] subscription updated:', sub.id, status);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[Stripe webhook] Error procesando', event.type, err);
    return new Response('Webhook handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
