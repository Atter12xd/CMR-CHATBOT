import { createClient } from '../lib/supabase';

export interface PaymentWithOrder {
  id: string;
  organizationId: string;
  chatId: string | null;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  orderId: string | null;
  orderCode: string | null;
  orderTotal: number | null;
  orderCustomerName: string | null;
  customerPhone: string | null;
}

export async function loadPaymentsPending(organizationId: string): Promise<PaymentWithOrder[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, organization_id, chat_id, customer_name, amount, method, status, notes, created_at')
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!payments?.length) return [];

  const out: PaymentWithOrder[] = [];
  for (const p of payments) {
    let orderId: string | null = null;
    let orderCode: string | null = null;
    let orderTotal: number | null = null;
    let orderCustomerName: string | null = null;
    let customerPhone: string | null = null;

    if (p.chat_id) {
      const { data: chat } = await supabase.from('chats').select('customer_phone').eq('id', p.chat_id).maybeSingle();
      if (chat?.customer_phone) customerPhone = chat.customer_phone;

      const { data: order } = await supabase
        .from('orders')
        .select('id, code, total, customer_name')
        .eq('chat_id', p.chat_id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (order) {
        orderId = order.id;
        orderCode = (order as { code?: string }).code ?? null;
        orderTotal = order.total != null ? Number(order.total) : null;
        orderCustomerName = order.customer_name ?? null;
      }
    }

    out.push({
      id: p.id,
      organizationId: p.organization_id,
      chatId: p.chat_id,
      customerName: p.customer_name,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      notes: p.notes ?? null,
      createdAt: p.created_at ? new Date(p.created_at) : new Date(),
      orderId,
      orderCode,
      orderTotal,
      orderCustomerName,
      customerPhone,
    });
  }
  return out;
}

export async function verifyPayment(
  paymentId: string,
  organizationId: string,
  amountReceipt: number,
  nameReceipt: string
): Promise<{
  success: boolean;
  chatId: string | null;
  customerPhone: string | null;
  message: string;
  error?: string;
}> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, chatId: null, customerPhone: null, message: '', error: 'No hay sesión' };

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('id, chat_id, amount, customer_name')
    .eq('id', paymentId)
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .single();

  if (payErr || !payment) {
    return { success: false, chatId: null, customerPhone: null, message: '', error: 'Pago no encontrado' };
  }

  const chatId = payment.chat_id;
  let customerPhone: string | null = null;
  if (chatId) {
    const { data: chat } = await supabase.from('chats').select('customer_phone').eq('id', chatId).maybeSingle();
    customerPhone = chat?.customer_phone ?? null;
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, total, customer_name')
    .eq('chat_id', chatId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const orderTotal = order?.total != null ? Number(order.total) : null;
  const orderName = (order?.customer_name ?? '').trim();
  const nameMatch = orderName.length > 0 && nameReceipt.trim().length > 0 &&
    orderName.toLowerCase().trim() === nameReceipt.trim().toLowerCase();
  const amountMatch = orderTotal != null && Math.abs(orderTotal - amountReceipt) < 0.02;

  if (amountMatch && nameMatch && order?.id) {
    await supabase.from('orders').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', order.id);
    await supabase.from('payments').update({ status: 'verified', verified_at: new Date().toISOString(), verified_by: session.user.id }).eq('id', paymentId);
    await supabase.from('chats').update({ bot_active: false }).eq('id', chatId);
    return {
      success: true,
      chatId,
      customerPhone,
      message: '✅ Pago completado. En unos instantes un asesor se comunicará contigo para coordinar los detalles finales.',
    };
  }

  await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
  return {
    success: false,
    chatId,
    customerPhone,
    message: 'Hola. Revisamos tu comprobante y el monto o el nombre no coinciden con tu pedido. Por favor verifica y vuelve a enviarnos el comprobante correcto.',
  };
}
