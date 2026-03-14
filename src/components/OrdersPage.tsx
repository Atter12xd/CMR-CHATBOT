import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Loader2, CreditCard, Check } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 size={24} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="text-sm text-slate-500 p-4">
        Crea o selecciona una organización para ver pedidos.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gestión</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pedidos</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona todos tus pedidos</p>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-900">Pagos pendientes de verificar</h3>
          </div>
          <p className="text-[12px] text-amber-700/90 mb-4">
            Ingresa el monto y el nombre exactos del comprobante. Si coinciden, el pedido pasará a &quot;Pago completado&quot; y el chat a modo humano.
          </p>
          <div className="space-y-4">
            {pendingPayments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-end gap-3 p-3 bg-white rounded-xl border border-amber-100">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-900">{p.orderCode || 'Pedido'} · {p.orderCustomerName || p.customerName}</p>
                  <p className="text-[12px] text-slate-500">Debe coincidir: S/ {(p.orderTotal ?? p.amount).toFixed(2)} · {p.orderCustomerName || p.customerName}</p>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto comprobante"
                  value={verifyAmount[p.id] ?? ''}
                  onChange={(e) => setVerifyAmount((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-28 px-2.5 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Nombre en comprobante"
                  value={verifyName[p.id] ?? ''}
                  onChange={(e) => setVerifyName((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 min-w-[140px] px-2.5 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => handleVerifyPayment(p)}
                  disabled={verifyingId === p.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {verifyingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Verificar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-150 ${
              selectedStatus === status
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {statusLabels[status] || status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-violet-600" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onOpenChat={handleOpenChat} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            {selectedStatus === 'all' ? 'No hay pedidos aún' : 'No hay pedidos con este estado'}
          </p>
        </div>
      )}
    </div>
  );
}
