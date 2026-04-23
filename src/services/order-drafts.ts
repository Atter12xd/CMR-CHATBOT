import { createClient } from '../lib/supabase';

const supabase = createClient();

export interface OrderDraftItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderDraft {
  id: string;
  status: 'draft' | 'ready' | 'converted' | 'abandoned';
  customerName?: string;
  customerDni?: string;
  addressOrReference?: string;
  subtotal: number;
  updatedAt: Date;
  items: OrderDraftItem[];
}

export async function getActiveDraftByChat(
  organizationId: string,
  chatId: string
): Promise<OrderDraft | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data: draftRow, error } = await supabase
    .from('order_drafts')
    .select('id, status, customer_name, customer_dni, address_or_reference, subtotal, updated_at')
    .eq('organization_id', organizationId)
    .eq('chat_id', chatId)
    .in('status', ['draft', 'ready'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!draftRow) return null;

  const row = draftRow as {
    id: string;
    status: 'draft' | 'ready' | 'converted' | 'abandoned';
    customer_name?: string | null;
    customer_dni?: string | null;
    address_or_reference?: string | null;
    subtotal?: number | string | null;
    updated_at: string;
  };

  const { data: itemRows, error: itemErr } = await supabase
    .from('order_draft_items')
    .select('id, product_name, quantity, price')
    .eq('draft_id', row.id)
    .order('created_at', { ascending: true });

  if (itemErr) throw itemErr;

  const items: OrderDraftItem[] = ((itemRows || []) as {
    id: string;
    product_name: string;
    quantity: number;
    price: number | string;
  }[]).map((item) => ({
    id: item.id,
    productName: item.product_name,
    quantity: item.quantity,
    price: Number(item.price || 0),
  }));

  return {
    id: row.id,
    status: row.status,
    customerName: row.customer_name || undefined,
    customerDni: row.customer_dni || undefined,
    addressOrReference: row.address_or_reference || undefined,
    subtotal: Number(row.subtotal || 0),
    updatedAt: new Date(row.updated_at),
    items,
  };
}
