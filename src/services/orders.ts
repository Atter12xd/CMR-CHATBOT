import { createClient } from '../lib/supabase';
import type { Order, OrderItem } from '../data/mockData';

const supabase = createClient();

interface RawOrderRow {
  id: string;
  code?: string | null;
  organization_id: string;
  chat_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  total: number | string;
  status: string;
  created_at?: string | null;
  delivery_address?: string | null;
  customer_dni?: string | null;
  courier?: string | null;
  shipping_tracking_code?: string | null;
  shipping_tracking_url?: string | null;
  tracking_token?: string | null;
  shipping_status?: string | null;
  shipping_last_event?: string | null;
  shipping_updated_at?: string | null;
}

interface RawOrderItemRow {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number | string;
}

interface RawChatPhoneRow {
  id: string;
  customer_phone: string | null;
}

export async function loadOrders(organizationId: string): Promise<Order[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!orders?.length) return [];

  const orderRows = orders as RawOrderRow[];
  const orderIds = orderRows.map((o) => o.id);
  const chatIds = [...new Set(orderRows.map((o) => o.chat_id).filter(Boolean))] as string[];

  const [{ data: items }, { data: chatPhones }] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds),
    chatIds.length
      ? supabase.from('chats').select('id, customer_phone').in('id', chatIds)
      : Promise.resolve({ data: [] as RawChatPhoneRow[] }),
  ]);

  const phoneByChat = new Map<string, string | undefined>();
  for (const row of (chatPhones as RawChatPhoneRow[] | null) || []) {
    phoneByChat.set(row.id, row.customer_phone ?? undefined);
  }

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const row of (items as RawOrderItemRow[] | null) || []) {
    const item: OrderItem = {
      id: row.id,
      name: row.product_name,
      quantity: row.quantity,
      price: Number(row.price),
    };
    const list = itemsByOrder.get(row.order_id) || [];
    list.push(item);
    itemsByOrder.set(row.order_id, list);
  }

  return orderRows.map((o) => {
    const cid = o.chat_id as string | null | undefined;
    return {
      id: o.id,
      code: o.code || undefined,
      customerName: o.customer_name,
      customerEmail: o.customer_email || '',
      customerPhone: cid ? phoneByChat.get(cid) : undefined,
      deliveryAddress: o.delivery_address ?? undefined,
      customerDni: o.customer_dni ?? undefined,
      items: itemsByOrder.get(o.id) || [],
      total: Number(o.total),
      status: o.status as Order['status'],
      courier: o.courier ?? undefined,
      trackingCode: o.shipping_tracking_code ?? undefined,
      trackingUrl: o.shipping_tracking_url ?? undefined,
      trackingToken: o.tracking_token ?? undefined,
      shippingStatus: (o.shipping_status as Order['shippingStatus'] | undefined) ?? undefined,
      shippingLastEvent: o.shipping_last_event ?? undefined,
      shippingUpdatedAt: o.shipping_updated_at
        ? new Date(o.shipping_updated_at)
        : undefined,
      createdAt: o.created_at ? new Date(o.created_at) : new Date(),
      chatId: cid || undefined,
    };
  });
}

export async function updateOrderStatus(
  organizationId: string,
  orderId: string,
  status: Order['status']
): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No hay sesión' };

  const { error } = await supabase
    .from('orders')
    .update({ status: status as any, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export interface UpdateOrderShippingInput {
  courier?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  trackingToken?: string | null;
  shippingStatus?: Order['shippingStatus'] | null;
  shippingLastEvent?: string | null;
}

export async function updateOrderShipping(
  organizationId: string,
  orderId: string,
  input: UpdateOrderShippingInput
): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No hay sesión' };

  const payload = {
    courier: input.courier?.trim() || null,
    shipping_tracking_code: input.trackingCode?.trim() || null,
    shipping_tracking_url: input.trackingUrl?.trim() || null,
    tracking_token: input.trackingToken?.trim() || null,
    shipping_status: input.shippingStatus || 'pending',
    shipping_last_event: input.shippingLastEvent?.trim() || null,
    shipping_updated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
