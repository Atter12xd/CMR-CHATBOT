import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Loader2, CreditCard, Check, Package } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { loadOrders } from '../services/orders';
import { loadPaymentsPending, verifyPayment, type PaymentWithOrder } from '../services/payments';
import { sendTextMessage } from '../services/whatsapp-messages';
import type { Order } from '../data/mockData';
import OrderCard from './OrderCard';


type OrderStatus = Order['status'] | 'all';


const statusLabels: Record<string, string> = {
  all: 'Todos',
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Pago completado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const statusDots: Record<string, string> = {
  all: 'bg-blue-400',
  pending: 'bg-amber-400',
  processing: 'bg-sky-400',
  completed: 'bg-emerald-400',
  shipped: 'bg-indigo-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-rose-400',
};


export default function OrdersPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PaymentWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyAmount, setVerifyAmount] = useState<Record<string, string>>({});
  const [verifyName, setVerifyName] = useState<Record<string, string>>({});

  const fetchOrders = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [list, payments] = await Promise.all([
        loadOrders(organizationId),
        loadPaymentsPending(organizationId).catch(() => []),
      ]);
      setOrders(list);
      setPendingPayments(payments);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [organizationId, fetchOrders]);

  const handleOpenChat = (chatId: string) => {
    window.location.href = `/chats?chat=${encodeURIComponent(chatId)}`;
  };

  const handleVerifyPayment = async (p: PaymentWithOrder) => {
    const amount = parseFloat(verifyAmount[p.id] ?? '');
    const name = (verifyName[p.id] ?? '').trim();
    if (Number.isNaN(amount) || amount < 0 || !name) {
      alert('Ingresa el monto y el nombre exactos del comprobante.');
      return;
    }
    if (!organizationId || !p.chatId) return;
    setVerifyingId(p.id);
    try {
      const result = await verifyPayment(p.id, organizationId, amount, name);
      if (result.chatId && result.customerPhone && result.message) {
        await sendTextMessage({
          chatId: result.chatId,
          text: result.message,
          baileysClientId: organizationId,
          baileysTo: result.customerPhone,
        });
      }
      alert(result.success ? 'Pago verificado. Se envió el mensaje al cliente y el chat pasó a modo humano.' : 'El monto o nombre no coinciden. Se notificó al cliente.');
      await fetchOrders();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al verificar');
    } finally {
      setVerifyingId(null);
    }
  };

  const statuses: OrderStatus[] = ['all', 'pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled'];
  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-blue-400" />
          </div>
          <p className="text-[13px] text-slate-600">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <ShoppingCart size={20} className="text-slate-700" />
        </div>
        <p className="text-[13px] text-slate-500">
          Crea o selecciona una organización para ver pedidos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 mb-1">
            Gestión
          </p>
          <h2 className="text-[32px] font-extrabold text-white tracking-tight leading-none">
            Pedidos
          </h2>
          <p className="text-slate-500 text-[14px] mt-2">
            Gestiona y verifica todos tus pedidos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg tabular-nums">
            {orders.length} total
          </span>
          {pendingPayments.length > 0 && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/8 border border-amber-500/15 px-3 py-1.5 rounded-lg">
              {pendingPayments.length} por verificar
            </span>
          )}
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
              <CreditCard size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white">Pagos pendientes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ingresa monto y nombre del comprobante para validar
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-end gap-3 p-4 bg-[#111827]/80 rounded-xl border border-white/[0.06]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white">
                    {p.orderCode || 'Pedido'} · {p.orderCustomerName || p.customerName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                    Esperado: S/ {(p.orderTotal ?? p.amount).toFixed(2)} · {p.orderCustomerName || p.customerName}
                  </p>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={verifyAmount[p.id] ?? ''}
                  onChange={(e) => setVerifyAmount((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-28 px-3 py-2.5 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <input
                  type="text"
                  placeholder="Nombre en comprobante"
                  value={verifyName[p.id] ?? ''}
                  onChange={(e) => setVerifyName((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 min-w-[160px] px-3 py-2.5 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={() => handleVerifyPayment(p)}
                  disabled={verifyingId === p.id}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all duration-150 shadow-lg shadow-emerald-500/15"
                >
                  {verifyingId === p.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} strokeWidth={3} />
                  )}
                  Verificar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedStatus === status
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedStatus === status ? 'bg-white' : (statusDots[status] || 'bg-slate-600')
              }`}
            />
            {statusLabels[status] || status}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <p className="text-[13px] text-slate-600">Cargando pedidos…</p>
          </div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onOpenChat={handleOpenChat} />
          ))}
        </div>
      ) : (
        <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] p-16 text-center">
          <div className="w-14 h-14 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-slate-700" />
          </div>
          <p className="text-[14px] font-medium text-slate-400">
            {selectedStatus === 'all'
              ? 'No hay pedidos aún'
              : `No hay pedidos "${statusLabels[selectedStatus]}"`}
          </p>
          <p className="text-[12px] text-slate-600 mt-1">
            Los pedidos aparecerán aquí cuando se generen
          </p>
        </div>
      )}
    </div>
  );
}