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
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

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

  return orders.map((o) => ({
    id: o.id,
    code: (o as { code?: string }).code,
    customerName: o.customer_name,
    customerEmail: o.customer_email || '',
    items: itemsByOrder.get(o.id) || [],
    total: Number(o.total),
    status: o.status as Order['status'],
    createdAt: o.created_at ? new Date(o.created_at) : new Date(),
    chatId: o.chat_id || undefined,
  }));
}
