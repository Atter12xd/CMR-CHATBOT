import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const token = (url.searchParams.get('token') || '').trim();
  if (!token || token.length < 8) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Servidor no configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = createClient(supabaseUrl, serviceKey);
  const { data: order, error } = await db
    .from('orders')
    .select(
      'id, code, customer_name, total, status, courier, shipping_tracking_code, shipping_tracking_url, shipping_status, shipping_last_event, shipping_updated_at, created_at'
    )
    .eq('tracking_token', token)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: 'No se pudo consultar seguimiento' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!order) {
    return new Response(JSON.stringify({ error: 'No encontramos ese seguimiento' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      orderCode: order.code || String(order.id).slice(0, 8),
      customerName: order.customer_name,
      total: Number(order.total || 0),
      orderStatus: order.status,
      courier: order.courier || null,
      trackingCode: order.shipping_tracking_code || null,
      trackingUrl: order.shipping_tracking_url || null,
      shippingStatus: order.shipping_status || 'pending',
      shippingLastEvent: order.shipping_last_event || null,
      shippingUpdatedAt: order.shipping_updated_at || null,
      createdAt: order.created_at || null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
