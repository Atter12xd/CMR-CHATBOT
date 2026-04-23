import { createClient } from '../lib/supabase';
import type { Order } from '../data/mockData';

const supabase = createClient();

export type OrderTemplateKey =
  | 'pedido_registrado'
  | 'pago_confirmado'
  | 'envio_en_transito'
  | 'envio_en_agencia'
  | 'envio_en_reparto'
  | 'pedido_entregado'
  | 'envio_incidencia';

const templateByShippingStatus: Record<NonNullable<Order['shippingStatus']>, OrderTemplateKey> = {
  pending: 'pedido_registrado',
  in_transit: 'envio_en_transito',
  at_agency: 'envio_en_agencia',
  out_for_delivery: 'envio_en_reparto',
  delivered: 'pedido_entregado',
  exception: 'envio_incidencia',
};

export function getTemplateKeyForOrder(order: Order, shippingStatus: NonNullable<Order['shippingStatus']>): OrderTemplateKey {
  if (order.status === 'completed') return 'pago_confirmado';
  return templateByShippingStatus[shippingStatus];
}

interface BuildTemplateMessageInput {
  order: Order;
  shippingStatus: NonNullable<Order['shippingStatus']>;
  shippingLastEvent?: string;
  courier?: string;
  trackingCode?: string;
  trackingUrl?: string;
  trackingPublicUrl?: string;
}

export function buildOrderTemplateMessage(input: BuildTemplateMessageInput): string {
  const code = input.order.code || input.order.id.slice(0, 8);
  const name = input.order.customerName || 'cliente';

  const commonLines = [
    `Pedido: ${code}`,
    input.courier ? `Courier: ${input.courier}` : '',
    input.trackingCode ? `Guía: ${input.trackingCode}` : '',
    input.shippingLastEvent ? `Detalle: ${input.shippingLastEvent}` : '',
    input.trackingUrl ? `Rastreo courier: ${input.trackingUrl}` : '',
    input.trackingPublicUrl ? `Seguimiento: ${input.trackingPublicUrl}` : '',
  ].filter(Boolean);

  const intro: Record<NonNullable<Order['shippingStatus']>, string> = {
    pending: `Hola ${name}, recibimos tu pedido y ya está en preparación.`,
    in_transit: `Hola ${name}, tu pedido ya salió y está en tránsito.`,
    at_agency: `Hola ${name}, tu pedido llegó a la agencia destino.`,
    out_for_delivery: `Hola ${name}, tu pedido salió a reparto.`,
    delivered: `Hola ${name}, tu pedido figura como entregado.`,
    exception: `Hola ${name}, detectamos una incidencia en tu envío.`,
  };

  return [intro[input.shippingStatus], ...commonLines].join('\n');
}

export async function logOrderNotification(input: {
  organizationId: string;
  orderId: string;
  chatId?: string | null;
  templateKey: OrderTemplateKey;
  status: 'queued' | 'sent' | 'failed';
  payload: Record<string, unknown>;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { error } = await supabase.from('order_notifications').insert({
    organization_id: input.organizationId,
    order_id: input.orderId,
    chat_id: input.chatId || null,
    channel: 'whatsapp',
    template_key: input.templateKey,
    status: input.status,
    payload: input.payload,
    sent_at: input.status === 'sent' ? new Date().toISOString() : null,
  } as never);

  if (error) throw error;
}

export interface OrderNotificationItem {
  id: string;
  templateKey: OrderTemplateKey;
  status: 'queued' | 'sent' | 'failed';
  payload: Record<string, unknown>;
  sentAt: Date | null;
  createdAt: Date;
}

export async function getOrderNotifications(
  organizationId: string,
  orderId: string,
  limit = 12
): Promise<OrderNotificationItem[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('order_notifications')
    .select('id, template_key, status, payload, sent_at, created_at')
    .eq('organization_id', organizationId)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => {
    const r = row as {
      id: string;
      template_key: OrderTemplateKey;
      status: 'queued' | 'sent' | 'failed';
      payload: Record<string, unknown> | null;
      sent_at: string | null;
      created_at: string;
    };
    return {
      id: r.id,
      templateKey: r.template_key,
      status: r.status,
      payload: r.payload || {},
      sentAt: r.sent_at ? new Date(r.sent_at) : null,
      createdAt: new Date(r.created_at),
    };
  });
}
