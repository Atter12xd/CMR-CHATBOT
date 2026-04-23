import { useState, useEffect, useCallback, useMemo, type DragEvent } from 'react';
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
  ExternalLink,
  Copy,
  Send,
  X,
} from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { loadOrders, updateOrderShipping, updateOrderStatus } from '../services/orders';
import { loadPaymentsPending, verifyPayment, type PaymentWithOrder } from '../services/payments';
import { sendTextMessage } from '../services/whatsapp-messages';
import type { Order } from '../data/mockData';
import KanbanOrderCard from './KanbanOrderCard';
import PageHeader from './PageHeader';
import StatsCard from './StatsCard';
import StatsCardSkeleton from './StatsCardSkeleton';

type OrderStatus = Order['status'] | 'all';

const statusLabels: Record<string, string> = {
  all: 'Todos',
  pending: 'Nuevo',
  processing: 'Confirmando',
  completed: 'Confirmado',
  shipped: 'En Envío',
  delivered: 'Entregado',
  cancelled: 'Rechazado',
};

const statusDots: Record<string, string> = {
  all: 'bg-brand-500',
  pending: 'bg-amber-400',
  processing: 'bg-brand-500',
  completed: 'bg-emerald-400',
  shipped: 'bg-indigo-400',
  delivered: 'bg-emerald-400',
  cancelled: 'bg-rose-400',
};

const shippingStatusLabels: Record<NonNullable<Order['shippingStatus']>, string> = {
  pending: 'Pendiente',
  in_transit: 'En tránsito',
  at_agency: 'En agencia destino',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  exception: 'Incidencia',
};

const shippingStatusOptions: NonNullable<Order['shippingStatus']>[] = [
  'pending',
  'in_transit',
  'at_agency',
  'out_for_delivery',
  'delivered',
  'exception',
];

const courierSuggestions = [
  'Shalom',
  'Olva',
  'Marvisur',
  'Flores',
  'Civa',
  'Cruz del Sur Cargo',
  'Recojo en tienda',
];

function normalizeCourier(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSuggestedTrackingUrl(courier: string, trackingCode: string): string {
  const code = trackingCode.trim();
  if (!code) return '';
  const c = normalizeCourier(courier);

  if (c.includes('shalom')) {
    return `https://rastrea.shalom.pe/?guia=${encodeURIComponent(code)}`;
  }
  if (c.includes('olva')) {
    return `https://www.olvacourier.com/rastreo-de-envio/?tracking=${encodeURIComponent(code)}`;
  }
  if (c.includes('marvisur')) {
    return `https://marvisur.com/seguimiento/?guia=${encodeURIComponent(code)}`;
  }

  if (courier.trim()) {
    return `https://www.google.com/search?q=${encodeURIComponent(
      `${courier} seguimiento ${code}`
    )}`;
  }
  return '';
}

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

export default function OrdersPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PaymentWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyAmount, setVerifyAmount] = useState<Record<string, string>>({});
  const [verifyName, setVerifyName] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'pipeline' | 'tabla' | 'seguimiento'>('pipeline');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Order['status'] | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [trackingSending, setTrackingSending] = useState(false);
  const [trackingForm, setTrackingForm] = useState<{
    courier: string;
    trackingCode: string;
    trackingUrl: string;
    shippingStatus: NonNullable<Order['shippingStatus']>;
    shippingLastEvent: string;
  }>({
    courier: '',
    trackingCode: '',
    trackingUrl: '',
    shippingStatus: 'pending',
    shippingLastEvent: '',
  });

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

  const activeTrackingOrder = useMemo(
    () => orders.find((o) => o.id === activeTrackingOrderId) || null,
    [orders, activeTrackingOrderId]
  );

  const getTrackingPublicUrl = useCallback((token?: string) => {
    if (!token) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/seguimiento?token=${encodeURIComponent(token)}`;
  }, []);

  const buildTrackingMessage = useCallback((order: Order, draft?: typeof trackingForm) => {
    const payload = draft || {
      courier: order.courier || '',
      trackingCode: order.trackingCode || '',
      trackingUrl: order.trackingUrl || '',
      shippingStatus: order.shippingStatus || 'pending',
      shippingLastEvent: order.shippingLastEvent || '',
    };
    const link = getTrackingPublicUrl(order.trackingToken);
    const code = order.code || order.id.slice(0, 8);
    const shippingLabel = shippingStatusLabels[payload.shippingStatus];
    const lines = [
      `Hola ${order.customerName}, tu pedido ${code} ya tiene actualización de envío.`,
      `Estado: ${shippingLabel}`,
    ];
    if (payload.courier) lines.push(`Courier: ${payload.courier}`);
    if (payload.trackingCode) lines.push(`Guía: ${payload.trackingCode}`);
    if (payload.shippingLastEvent) lines.push(`Detalle: ${payload.shippingLastEvent}`);
    if (payload.trackingUrl) lines.push(`Rastreo courier: ${payload.trackingUrl}`);
    if (link) lines.push(`Seguimiento: ${link}`);
    return lines.join('\n');
  }, [getTrackingPublicUrl]);

  const openTrackingEditor = useCallback((order: Order) => {
    window.location.href = `/seguimiento-pedidos?order=${encodeURIComponent(order.id)}`;
  }, []);

  const handleSaveTracking = useCallback(async () => {
    if (!organizationId || !activeTrackingOrder) return;
    setTrackingSaving(true);
    try {
      const token = activeTrackingOrder.trackingToken || crypto.randomUUID();
      const resolvedTrackingUrl =
        trackingForm.trackingUrl.trim() ||
        getSuggestedTrackingUrl(trackingForm.courier, trackingForm.trackingCode);
      const result = await updateOrderShipping(organizationId, activeTrackingOrder.id, {
        courier: trackingForm.courier || null,
        trackingCode: trackingForm.trackingCode || null,
        trackingUrl: resolvedTrackingUrl || null,
        shippingStatus: trackingForm.shippingStatus,
        shippingLastEvent: trackingForm.shippingLastEvent || null,
        trackingToken: token,
      });
      if (!result.success) {
        alert(result.error || 'No se pudo guardar seguimiento');
        return;
      }
      await fetchOrders();
      alert('Seguimiento guardado');
      setActiveTrackingOrderId(null);
    } finally {
      setTrackingSaving(false);
    }
  }, [organizationId, activeTrackingOrder, trackingForm, fetchOrders]);

  const handleSendTrackingToClient = useCallback(async () => {
    if (!organizationId || !activeTrackingOrder) return;
    if (!activeTrackingOrder.trackingToken) {
      alert('Primero guarda el seguimiento para generar el link público.');
      return;
    }
    if (!activeTrackingOrder.chatId || !activeTrackingOrder.customerPhone) {
      alert('Este pedido no tiene chat o teléfono para enviar el seguimiento.');
      return;
    }
    setTrackingSending(true);
    try {
      const message = buildTrackingMessage(activeTrackingOrder, trackingForm);
      const sent = await sendTextMessage({
        chatId: activeTrackingOrder.chatId,
        text: message,
        baileysClientId: organizationId,
        baileysTo: activeTrackingOrder.customerPhone,
      });
      if (!sent.success) {
        alert(sent.error || 'No se pudo enviar el mensaje');
        return;
      }
      alert('Seguimiento enviado al cliente');
    } finally {
      setTrackingSending(false);
    }
  }, [organizationId, activeTrackingOrder, buildTrackingMessage, trackingForm]);

  const handleCopyTrackingMessage = useCallback(async () => {
    if (!activeTrackingOrder) return;
    try {
      await navigator.clipboard.writeText(buildTrackingMessage(activeTrackingOrder, trackingForm));
      alert('Mensaje copiado');
    } catch {
      alert('No se pudo copiar el mensaje');
    }
  }, [activeTrackingOrder, buildTrackingMessage, trackingForm]);

  const handleDropOnColumn = async (status: Order['status'], e: DragEvent) => {
    e.preventDefault();
    setDraggingId(null);
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId || !organizationId) return;
    const res = await updateOrderStatus(organizationId, orderId, status);
    if (res.success) await fetchOrders();
    else alert(res.error || 'No se pudo actualizar el estado');
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

  const kanbanBoard = useMemo(() => {
    const cols: { status: Order['status']; title: string; headerBg: string; headerColor: string }[] = [
      { status: 'pending', title: 'Nuevo', headerBg: '#F59E0B', headerColor: '#fff' },
      { status: 'processing', title: 'Confirmando', headerBg: '#1B70FF', headerColor: '#fff' },
      { status: 'completed', title: 'Confirmado', headerBg: '#10B981', headerColor: '#fff' },
      { status: 'shipped', title: 'En Envío', headerBg: '#8B5CF6', headerColor: '#fff' },
      { status: 'delivered', title: 'Entregado', headerBg: '#14B8A6', headerColor: '#fff' },
      { status: 'cancelled', title: 'Rechazado', headerBg: '#EF4444', headerColor: '#fff' },
    ];
    return cols.map((col) => {
      const list = filteredOrders.filter((o) => o.status === col.status);
      const sum = list.reduce((s, o) => s + o.total, 0);
      return { ...col, list, sum };
    });
  }, [filteredOrders]);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-app-muted">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader title="Pedidos" description="Gestión y seguimiento de pedidos COD" />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-app-muted text-[14px] leading-relaxed">
              Crea o selecciona una organización para ver pedidos. Ve a{' '}
              <a href="/configuracion" className="text-brand-600 font-semibold hover:text-brand-500">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Pedidos" description="Gestión y seguimiento de pedidos COD" />
        <div className="flex rounded-md border border-[#E5E7EB] bg-white p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('pipeline')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-brand-500 text-white'
                : 'text-[#6D6D70] hover:bg-[#f9fafb]'
            }`}
          >
            <LayoutGrid size={13} />
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tabla')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-colors ${
              viewMode === 'tabla'
                ? 'bg-brand-500 text-white'
                : 'text-[#6D6D70] hover:bg-[#f9fafb]'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" aria-hidden>
              <rect x="3" y="3" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" opacity=".6" />
              <rect x="3" y="17" width="18" height="4" rx="1" opacity=".4" />
            </svg>
            Tabla
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-semibold text-[#6D6D70] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-full tabular-nums">
          {orders.length} total
        </span>
        {pendingPayments.length > 0 && (
          <span className="font-semibold text-amber-700 bg-[#FFFBEB] border border-amber-200 px-2.5 py-1 rounded-full">
            {pendingPayments.length} por verificar
          </span>
        )}
      </div>

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
              accentClassName="text-brand-500"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Pendientes"
              value={orderStats.pending}
              icon={Clock}
              accentClassName="text-amber-500"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="En proceso"
              value={orderStats.inPipeline}
              icon={Truck}
              accentClassName="text-brand-500"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Ingresos (todos)"
              value={`S/ ${orderStats.revenue.toFixed(2)}`}
              icon={DollarSign}
              accentClassName="text-violet-500"
            />
          </motion.div>
        </motion.div>
      )}

      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-amber-600 shrink-0 shadow-sm">
              <CreditCard className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-app-ink tracking-tight">Pagos pendientes</h3>
              <p className="text-[12px] text-app-muted mt-0.5 font-medium">
                Monto y nombre del comprobante para validar
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-end gap-3 p-4 rounded-2xl border border-app-line bg-app-field/60 hover:bg-app-field transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-app-ink leading-snug">
                    {p.orderCode || 'Pedido'} · {p.orderCustomerName || p.customerName}
                  </p>
                  <p className="text-[12px] text-app-muted mt-1 font-mono tabular-nums">
                    Esperado: S/ {(p.orderTotal ?? p.amount).toFixed(2)}
                  </p>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={verifyAmount[p.id] ?? ''}
                  onChange={(e) => setVerifyAmount((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-28 min-w-0 px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-full text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/35 transition-all"
                />
                <input
                  type="text"
                  placeholder="Nombre en comprobante"
                  value={verifyName[p.id] ?? ''}
                  onChange={(e) => setVerifyName((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 min-w-[180px] px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-full text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/35 transition-all"
                />
                <motion.button
                  type="button"
                  onClick={() => handleVerifyPayment(p)}
                  disabled={verifyingId === p.id}
                  whileTap={{ scale: verifyingId === p.id ? 1 : 0.98 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-[14px] font-semibold rounded-full hover:bg-emerald-500 disabled:opacity-50 shadow-md transition-colors"
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
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-[#6D6D70] border-[#E5E7EB] hover:bg-[#f9fafb]'
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
              <Loader2 size={20} className="animate-spin text-brand-500" />
            </div>
            <p className="text-[14px] text-[#6D6D70]">Cargando pedidos…</p>
          </div>
        </div>
      ) : viewMode === 'seguimiento' ? (
        filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,.08)]">
            <Truck className="size-8 text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[15px] font-medium text-[#3D3D40]">
              {selectedStatus === 'all' ? 'No hay pedidos aún' : `No hay pedidos «${statusLabels[selectedStatus]}»`}
            </p>
            <p className="text-[13px] text-[#6D6D70] mt-1 px-6">
              Cuando tengas pedidos, podrás gestionar su seguimiento aquí.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[320px,1fr] gap-4 items-start">
            <div className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-app-line">
                <h3 className="text-[14px] font-semibold text-app-ink">Seguimiento de pedidos</h3>
                <p className="text-[12px] text-app-muted mt-0.5">
                  Elige un pedido para actualizar guía, estado y mensaje al cliente.
                </p>
              </div>
              <div className="max-h-[520px] overflow-y-auto divide-y divide-app-line">
                {filteredOrders.map((order) => {
                  const active = order.id === activeTrackingOrderId;
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => openTrackingEditor(order)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        active ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-app-field/50'
                      }`}
                    >
                      <p className="text-[13px] font-semibold text-app-ink">{order.code || order.id.slice(0, 8)}</p>
                      <p className="text-[12px] text-app-muted truncate">{order.customerName}</p>
                      <p className="text-[11px] text-app-muted mt-1">
                        {order.shippingStatus ? shippingStatusLabels[order.shippingStatus] : 'Pendiente'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {!activeTrackingOrder && (
              <div className="rounded-ref border border-app-line bg-ref-card p-6 shadow-sm">
                <p className="text-[14px] font-semibold text-app-ink">Selecciona un pedido</p>
                <p className="text-[13px] text-app-muted mt-1">
                  Abre un pedido de la izquierda para editar courier, guía, estado y enviar el link al cliente.
                </p>
              </div>
            )}
          </div>
        )
      ) : viewMode === 'pipeline' ? (
        orders.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,.08)]">
            <Package className="size-8 text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[15px] font-medium text-[#3D3D40]">
              {selectedStatus === 'all' ? 'No hay pedidos aún' : `No hay pedidos «${statusLabels[selectedStatus]}»`}
            </p>
            <p className="text-[13px] text-[#6D6D70] mt-1 px-6">
              Los pedidos aparecerán aquí cuando se generen desde el chat.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {kanbanBoard.map((col) => (
              <div key={col.status} className="flex flex-col min-w-[190px] w-[190px] shrink-0">
                <div
                  className="px-3 py-2.5 rounded-t-[10px] flex items-center justify-between"
                  style={{ background: col.headerBg, color: col.headerColor }}
                >
                  <span className="text-[12px] font-bold leading-none">{col.title}</span>
                  <span
                    className="text-[11px] font-bold px-[7px] py-px rounded-full tabular-nums leading-none"
                    style={{ background: 'rgba(255,255,255,0.25)' }}
                  >
                    {col.list.length}
                  </span>
                </div>
                <div
                  className="text-[11px] font-semibold px-3 pt-1 pb-2 bg-white border-x border-[#E5E7EB]"
                  style={{ color: col.headerBg }}
                >
                  S/ {col.sum.toFixed(2)}
                </div>
                <div
                  className={`flex-1 min-h-[200px] border border-t-0 border-[#E5E7EB] rounded-b-[10px] bg-[#f9fafb] p-2 flex flex-col gap-2 transition-[background-color,box-shadow] ${
                    dragOverStatus === col.status ? 'bg-[#f0f7ff] ring-2 ring-inset ring-[#1B70FF]/25' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverStatus(col.status);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStatus(null);
                  }}
                  onDrop={(e) => {
                    setDragOverStatus(null);
                    void handleDropOnColumn(col.status, e);
                  }}
                >
                  {col.list.map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('orderId', order.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingId(order.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverStatus(null);
                      }}
                      className={draggingId === order.id ? 'opacity-40' : ''}
                    >
                      <KanbanOrderCard
                        order={order}
                        onOpenChat={handleOpenChat}
                        onOpenTracking={openTrackingEditor}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-lg py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,.08)]">
          <Package className="size-8 text-[#d1d5db] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-[#3D3D40]">
            {selectedStatus === 'all' ? 'No hay pedidos aún' : `No hay pedidos «${statusLabels[selectedStatus]}»`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Pedido
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Cliente
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Teléfono
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Estado
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Envío
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Total
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Ciudad
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Fecha
                  </th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#6D6D70]">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="py-2.5 px-3 font-mono text-[12px] text-brand-600 font-bold">
                      {order.code || order.id.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 text-[#3D3D40]">{order.customerName}</td>
                    <td className="py-2.5 px-3 text-[#6D6D70]">{order.customerPhone || '—'}</td>
                    <td className="py-2.5 px-3 text-[12px]">{statusLabels[order.status]}</td>
                    <td className="py-2.5 px-3 text-[12px] text-[#6D6D70] whitespace-nowrap">
                      {order.shippingStatus ? shippingStatusLabels[order.shippingStatus] : 'Pendiente'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold tabular-nums">S/ {order.total.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-[#6D6D70] max-w-[140px] truncate" title={order.deliveryAddress}>
                      {order.deliveryAddress
                        ? order.deliveryAddress.split(',').pop()?.trim() || order.deliveryAddress
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#6D6D70] text-[12px] whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openTrackingEditor(order)}
                          className="text-[12px] font-semibold text-violet-600 hover:underline"
                        >
                          Seguimiento
                        </button>
                        {order.chatId ? (
                          <button
                            type="button"
                            onClick={() => handleOpenChat(order.chatId!)}
                            className="text-[12px] font-semibold text-brand-500 hover:underline"
                          >
                            Chat
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'seguimiento' && activeTrackingOrder && (
        <div className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-app-line flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">Sección separada</p>
              <h3 className="text-[15px] font-semibold text-app-ink">
                Seguimiento de envíos · Pedido {activeTrackingOrder.code || activeTrackingOrder.id.slice(0, 8)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTrackingOrderId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
            >
              <X size={13} />
              Cerrar sección
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm text-app-muted">
                Courier
                <input
                  type="text"
                  list="courier-suggestions"
                  value={trackingForm.courier}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, courier: e.target.value }))}
                  placeholder="Ej: Shalom"
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                />
                <datalist id="courier-suggestions">
                  {courierSuggestions.map((courier) => (
                    <option key={courier} value={courier} />
                  ))}
                </datalist>
              </label>
              <label className="text-sm text-app-muted">
                N° guía
                <input
                  type="text"
                  value={trackingForm.trackingCode}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, trackingCode: e.target.value }))}
                  placeholder="Ej: SHA-12345678"
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                />
              </label>
              <label className="text-sm text-app-muted sm:col-span-2">
                Link rastreo courier (opcional)
                <div className="mt-1 flex gap-2">
                  <input
                    type="url"
                    value={trackingForm.trackingUrl}
                    onChange={(e) => setTrackingForm((p) => ({ ...p, trackingUrl: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const suggested = getSuggestedTrackingUrl(
                        trackingForm.courier,
                        trackingForm.trackingCode
                      );
                      if (!suggested) {
                        alert('Primero ingresa courier y número de guía.');
                        return;
                      }
                      setTrackingForm((p) => ({ ...p, trackingUrl: suggested }));
                    }}
                    className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-app-line bg-white hover:bg-app-field whitespace-nowrap"
                  >
                    Sugerir link
                  </button>
                </div>
              </label>
              <label className="text-sm text-app-muted">
                Estado de envío
                <select
                  value={trackingForm.shippingStatus}
                  onChange={(e) =>
                    setTrackingForm((p) => ({
                      ...p,
                      shippingStatus: e.target.value as NonNullable<Order['shippingStatus']>,
                    }))
                  }
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                >
                  {shippingStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {shippingStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-app-muted sm:col-span-2">
                Último evento
                <textarea
                  value={trackingForm.shippingLastEvent}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, shippingLastEvent: e.target.value }))}
                  rows={2}
                  placeholder="Ej: Llegó a agencia de Trujillo, listo para recojo."
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink resize-none"
                />
              </label>
            </div>

            <div className="rounded-xl border border-app-line bg-app-field/50 p-3">
              <p className="text-xs text-app-muted font-medium mb-2">Link público para cliente</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-xs text-app-ink bg-white border border-app-line px-2 py-1 rounded-md">
                  {activeTrackingOrder.trackingToken
                    ? getTrackingPublicUrl(activeTrackingOrder.trackingToken)
                    : 'Se genera al guardar'}
                </code>
                {activeTrackingOrder.trackingToken && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          getTrackingPublicUrl(activeTrackingOrder.trackingToken || '')
                        );
                        alert('Link copiado');
                      } catch {
                        alert('No se pudo copiar');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-app-line bg-white hover:bg-app-field"
                  >
                    <Copy size={13} />
                    Copiar link
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-app-line flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyTrackingMessage}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
              >
                <Copy size={13} />
                Copiar mensaje
              </button>
              <button
                type="button"
                onClick={handleSendTrackingToClient}
                disabled={trackingSending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {trackingSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Enviar al cliente
              </button>
              {activeTrackingOrder.trackingUrl && (
                <a
                  href={activeTrackingOrder.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
                >
                  <ExternalLink size={13} />
                  Courier
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTrackingOrderId(null)}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTracking}
                disabled={trackingSaving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {trackingSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Guardar seguimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
