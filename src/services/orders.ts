import { createClient } from '../lib/supabase';
import type { Order, OrderItem } from '../data/mockData';

const supabase = createClient();

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

  const orderIds = orders.map((o) => o.id);
  const chatIds = [...new Set(orders.map((o) => o.chat_id).filter(Boolean))] as string[];

  const [{ data: items }, { data: chatPhones }] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds),
    chatIds.length
      ? supabase.from('chats').select('id, customer_phone').in('id', chatIds)
      : Promise.resolve({ data: [] as { id: string; customer_phone: string | null }[] }),
  ]);

  const phoneByChat = new Map<string, string | undefined>();
  for (const row of chatPhones || []) {
    phoneByChat.set(row.id, row.customer_phone ?? undefined);
  }

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const row of items || []) {
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

  return orders.map((o) => {
    const cid = o.chat_id as string | null | undefined;
    return {
      id: o.id,
      code: (o as { code?: string }).code,
      customerName: o.customer_name,
      customerEmail: o.customer_email || '',
      customerPhone: cid ? phoneByChat.get(cid) : undefined,
      deliveryAddress: (o as { delivery_address?: string }).delivery_address ?? undefined,
      customerDni: (o as { customer_dni?: string }).customer_dni ?? undefined,
      items: itemsByOrder.get(o.id) || [],
      total: Number(o.total),
      status: o.status as Order['status'],
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
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
