import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  CreditCard,
  Check,
  Package,
  DollarSign,
  Clock,
  Truck,
  LayoutGrid,
} from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { loadOrders } from '../services/orders';
import { loadPaymentsPending, verifyPayment, type PaymentWithOrder } from '../services/payments';
import { sendTextMessage } from '../services/whatsapp-messages';
import type { Order } from '../data/mockData';
import OrderCard from './OrderCard';
import PageHeader from './PageHeader';
import StatsCard from './StatsCard';
import StatsCardSkeleton from './StatsCardSkeleton';

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
  all: 'bg-brand-400',
  pending: 'bg-amber-400',
  processing: 'bg-sky-400',
  completed: 'bg-emerald-400',
  shipped: 'bg-indigo-400',
  delivered: 'bg-emerald-400',
  cancelled: 'bg-rose-400',
};

const statsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const statsItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
};

const cardGrid = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
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

  const orderStats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    const inPipeline = orders.filter((o) =>
      ['processing', 'completed', 'shipped'].includes(o.status)
    ).length;
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    return { total: orders.length, pending, inPipeline, revenue };
  }, [orders]);

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

  const statuses: OrderStatus[] = [
    'all',
    'pending',
    'processing',
    'completed',
    'shipped',
    'delivered',
    'cancelled',
  ];
  const filteredOrders =
    selectedStatus === 'all' ? orders : orders.filter((order) => order.status === selectedStatus);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-400" />
          </div>
          <p className="text-[14px] text-slate-500">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader
          eyebrow="Gestión"
          title="Pedidos"
          description="Gestiona y verifica todos tus pedidos."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-slate-400 text-[14px] leading-relaxed">
              Crea o selecciona una organización para ver pedidos. Ve a{' '}
              <a href="/configuracion" className="text-brand-400 font-semibold hover:text-brand-300">
                Configuración
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-professional">
      <PageHeader
        eyebrow="Gestión"
        title="Pedidos"
        description="Gestiona y verifica todos tus pedidos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.05] border border-app-line px-3 py-1.5 rounded-xl tabular-nums">
              {orders.length} total
            </span>
            {pendingPayments.length > 0 && (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/12 border border-amber-500/25 px-3 py-1.5 rounded-xl">
                {pendingPayments.length} por verificar
              </span>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-busy="true" aria-label="Cargando métricas">
          {[0, 1, 2, 3].map((k) => (
            <StatsCardSkeleton key={k} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Total pedidos"
              value={orderStats.total}
              icon={LayoutGrid}
              accentClassName="text-brand-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Pendientes"
              value={orderStats.pending}
              icon={Clock}
              accentClassName="text-amber-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="En proceso"
              value={orderStats.inPipeline}
              icon={Truck}
              accentClassName="text-sky-400"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Ingresos (todos)"
              value={`S/ ${orderStats.revenue.toFixed(2)}`}
              icon={DollarSign}
              accentClassName="text-purple-400"
            />
          </motion.div>
        </motion.div>
      )}

      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card"
        >
          <div className="px-5 py-4 sm:px-6 bg-gradient-to-br from-amber-500/12 via-app-card to-orange-600/10 border-b border-app-line flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-app-line text-amber-400 shrink-0">
              <CreditCard className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Pagos pendientes</h3>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">
                Monto y nombre del comprobante para validar
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-app-line bg-white/[0.03] hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white leading-snug">
                    {p.orderCode || 'Pedido'} · {p.orderCustomerName || p.customerName}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1 font-mono tabular-nums">
                    Esperado: S/ {(p.orderTotal ?? p.amount).toFixed(2)}
                  </p>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={verifyAmount[p.id] ?? ''}
                  onChange={(e) => setVerifyAmount((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-28 min-w-0 px-3 py-2.5 text-[14px] bg-white/[0.05] border border-app-line rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                />
                <input
                  type="text"
                  placeholder="Nombre en comprobante"
                  value={verifyName[p.id] ?? ''}
                  onChange={(e) => setVerifyName((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 min-w-[180px] px-3 py-2.5 text-[14px] bg-white/[0.05] border border-app-line rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                />
                <motion.button
                  type="button"
                  onClick={() => handleVerifyPayment(p)}
                  disabled={verifyingId === p.id}
                  whileTap={{ scale: verifyingId === p.id ? 1 : 0.98 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-[14px] font-semibold rounded-xl hover:bg-emerald-400 disabled:opacity-50 border border-emerald-400/30 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  {verifyingId === p.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} strokeWidth={2.5} />
                  )}
                  Verificar
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {statuses.map((status) => {
          const active = selectedStatus === status;
          return (
            <motion.button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 border ${
                active
                  ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white border-transparent shadow-md shadow-brand-500/25'
                  : 'bg-white/[0.04] text-slate-400 border-app-line hover:bg-white/[0.07] hover:text-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  active ? 'bg-white' : statusDots[status] || 'bg-slate-600'
                }`}
              />
              {statusLabels[status] || status}
            </motion.button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="app-spinner">
              <Loader2 size={20} className="animate-spin text-brand-400" />
            </div>
            <p className="text-[14px] text-slate-500">Cargando pedidos…</p>
          </div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <motion.div
          variants={cardGrid}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filteredOrders.map((order) => (
            <motion.div key={order.id} variants={cardItem} className="min-w-0">
              <OrderCard order={order} onOpenChat={handleOpenChat} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-app-line bg-app-card shadow-app-card overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-600/15 border border-brand-500/20 flex items-center justify-center mb-4">
              <Package className="size-7 text-slate-500" />
            </div>
            <p className="text-[15px] font-medium text-slate-300">
              {selectedStatus === 'all'
                ? 'No hay pedidos aún'
                : `No hay pedidos «${statusLabels[selectedStatus]}»`}
            </p>
            <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
              Los pedidos aparecerán aquí cuando se generen desde el chat o el flujo de venta.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
