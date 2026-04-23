import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  PackageCheck,
  Route,
  Search,
  Send,
  Truck,
} from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import type { Order } from '../data/mockData';
import { loadOrders, updateOrderShipping } from '../services/orders';
import { sendTextMessage } from '../services/whatsapp-messages';
import {
  buildOrderTemplateMessage,
  getOrderNotifications,
  getTemplateKeyForOrder,
  logOrderNotification,
  type OrderNotificationItem,
} from '../services/order-notifications';
import PageHeader from './PageHeader';

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

const timelineStages = [
  { key: 'pending', label: 'Registrado' },
  { key: 'in_transit', label: 'En tránsito' },
  { key: 'at_agency', label: 'En agencia' },
  { key: 'out_for_delivery', label: 'En reparto' },
  { key: 'delivered', label: 'Entregado' },
] as const;

const quickEventTemplates = [
  { status: 'in_transit' as const, text: 'Tu pedido salió de agencia y está en tránsito.' },
  { status: 'at_agency' as const, text: 'Tu pedido llegó a la agencia destino y está listo para recojo.' },
  { status: 'out_for_delivery' as const, text: 'Tu pedido salió a reparto y llegará pronto.' },
  { status: 'delivered' as const, text: 'Tu pedido fue entregado correctamente. ¡Gracias por tu compra!' },
];

const REFRESH_INTERVAL_MS = 30000;
const SLA_WARNING_HOURS = 24;
const SLA_CRITICAL_HOURS = 48;

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
  if (c.includes('shalom')) return `https://rastrea.shalom.pe/?guia=${encodeURIComponent(code)}`;
  if (c.includes('olva')) return `https://www.olvacourier.com/rastreo-de-envio/?tracking=${encodeURIComponent(code)}`;
  if (c.includes('marvisur')) return `https://marvisur.com/seguimiento/?guia=${encodeURIComponent(code)}`;
  if (!courier.trim()) return '';
  return `https://www.google.com/search?q=${encodeURIComponent(`${courier} seguimiento ${code}`)}`;
}

export default function OrderTrackingPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NonNullable<Order['shippingStatus']>>('all');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendOnSave, setSendOnSave] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotificationItem[]>([]);
  const [notificationsFilter, setNotificationsFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const [retryingNotificationId, setRetryingNotificationId] = useState<string | null>(null);
  const [highlightEditor, setHighlightEditor] = useState(false);
  const [autoEventPrefill, setAutoEventPrefill] = useState<string | null>(null);
  const [form, setForm] = useState({
    courier: '',
    trackingCode: '',
    trackingUrl: '',
    shippingStatus: 'pending' as NonNullable<Order['shippingStatus']>,
    shippingLastEvent: '',
  });
  const editorPanelRef = useRef<HTMLDivElement | null>(null);
  const eventTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const list = await loadOrders(organizationId);
      setOrders(list);
      setLastRefreshAt(new Date());
    } catch (err) {
      console.error('Error cargando seguimiento:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    void fetchOrders();
  }, [organizationId, fetchOrders]);

  useEffect(() => {
    if (!organizationId || !autoRefresh) return;
    const timer = window.setInterval(() => {
      void fetchOrders();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [organizationId, autoRefresh, fetchOrders]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (orderId) setActiveOrderId(orderId);
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && (order.shippingStatus || 'pending') !== statusFilter) return false;
      if (!q) return true;
      return (
        order.customerName.toLowerCase().includes(q) ||
        (order.code || order.id).toLowerCase().includes(q) ||
        (order.trackingCode || '').toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const trackingMetrics = useMemo(() => {
    const counters: Record<NonNullable<Order['shippingStatus']>, number> = {
      pending: 0,
      in_transit: 0,
      at_agency: 0,
      out_for_delivery: 0,
      delivered: 0,
      exception: 0,
    };
    for (const order of orders) {
      const status = order.shippingStatus || 'pending';
      counters[status] += 1;
    }
    return counters;
  }, [orders]);

  const activeOrder = useMemo(
    () => filteredOrders.find((o) => o.id === activeOrderId) || orders.find((o) => o.id === activeOrderId) || null,
    [filteredOrders, orders, activeOrderId]
  );

  useEffect(() => {
    if (!activeOrder) return;
    setForm({
      courier: activeOrder.courier || '',
      trackingCode: activeOrder.trackingCode || '',
      trackingUrl: activeOrder.trackingUrl || '',
      shippingStatus: activeOrder.shippingStatus || 'pending',
      shippingLastEvent: activeOrder.shippingLastEvent || autoEventPrefill || '',
    });
    if (autoEventPrefill) setAutoEventPrefill(null);
  }, [activeOrder?.id, autoEventPrefill]);

  useEffect(() => {
    if (!organizationId || !activeOrder) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    setNotificationsLoading(true);
    getOrderNotifications(organizationId, activeOrder.id)
      .then((items) => {
        if (!cancelled) setNotifications(items);
      })
      .catch((err) => {
        console.error('Error cargando notificaciones de pedido:', err);
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setNotificationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, activeOrder?.id]);

  const getTrackingPublicUrl = useCallback((token?: string) => {
    if (!token) return '';
    return `${window.location.origin}/seguimiento?token=${encodeURIComponent(token)}`;
  }, []);

  const buildTrackingMessage = useCallback((order: Order) => {
    const link = getTrackingPublicUrl(order.trackingToken);
    return buildOrderTemplateMessage({
      order,
      shippingStatus: form.shippingStatus,
      shippingLastEvent: form.shippingLastEvent,
      courier: form.courier,
      trackingCode: form.trackingCode,
      trackingUrl: form.trackingUrl,
      trackingPublicUrl: link || undefined,
    });
  }, [form, getTrackingPublicUrl]);

  const activeTimelineIndex = useMemo(() => {
    const current = form.shippingStatus;
    if (current === 'exception') return 0;
    return Math.max(0, timelineStages.findIndex((s) => s.key === current));
  }, [form.shippingStatus]);

  const getSlaMeta = useCallback((order: Order) => {
    const endStates: NonNullable<Order['shippingStatus']>[] = ['delivered', 'exception'];
    const status = order.shippingStatus || 'pending';
    if (endStates.includes(status)) {
      return { label: status === 'delivered' ? 'Cerrado' : 'Incidencia', tone: 'neutral' as const };
    }
    const base = order.shippingUpdatedAt || order.createdAt;
    const hours = Math.max(0, (Date.now() - base.getTime()) / 3600000);
    if (hours >= SLA_CRITICAL_HOURS) return { label: 'SLA vencido', tone: 'critical' as const };
    if (hours >= SLA_WARNING_HOURS) return { label: 'En riesgo', tone: 'warning' as const };
    return { label: 'En tiempo', tone: 'ok' as const };
  }, []);

  const slaClassByTone: Record<'ok' | 'warning' | 'critical' | 'neutral', string> = {
    ok: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/20',
    warning: 'bg-amber-500/12 text-amber-700 border-amber-500/20',
    critical: 'bg-rose-500/12 text-rose-700 border-rose-500/20',
    neutral: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  };

  const getTemplateByStatus = useCallback((status: NonNullable<Order['shippingStatus']>) => {
    return quickEventTemplates.find((tpl) => tpl.status === status)?.text || '';
  }, []);

  const slaAlerts = useMemo(() => {
    const activeStatuses: NonNullable<Order['shippingStatus']>[] = [
      'pending',
      'in_transit',
      'at_agency',
      'out_for_delivery',
    ];

    return orders
      .filter((order) => activeStatuses.includes(order.shippingStatus || 'pending'))
      .map((order) => {
        const base = order.shippingUpdatedAt || order.createdAt;
        const hours = Math.max(0, (Date.now() - base.getTime()) / 3600000);
        const meta = getSlaMeta(order);
        return { order, hours, meta };
      })
      .filter((x) => x.meta.tone === 'warning' || x.meta.tone === 'critical')
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [orders, getSlaMeta]);

  const focusOrderEditor = useCallback((orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      const status = target.shippingStatus || 'pending';
      const suggestedEvent = getTemplateByStatus(status);
      const sla = getSlaMeta(target);
      if (!target.shippingLastEvent && suggestedEvent && (sla.tone === 'warning' || sla.tone === 'critical')) {
        setAutoEventPrefill(suggestedEvent);
      } else {
        setAutoEventPrefill(null);
      }
    }
    setActiveOrderId(orderId);
    window.setTimeout(() => {
      editorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightEditor(true);
      eventTextareaRef.current?.focus();
      eventTextareaRef.current?.select();
      window.setTimeout(() => setHighlightEditor(false), 1800);
    }, 60);
  }, [orders, getTemplateByStatus, getSlaMeta]);

  const handleSave = useCallback(async () => {
    if (!organizationId || !activeOrder) return;
    setSaving(true);
    try {
      const token = activeOrder.trackingToken || crypto.randomUUID();
      const resolvedTrackingUrl = form.trackingUrl.trim() || getSuggestedTrackingUrl(form.courier, form.trackingCode);
      const statusChanged = (activeOrder.shippingStatus || 'pending') !== form.shippingStatus;
      const result = await updateOrderShipping(organizationId, activeOrder.id, {
        courier: form.courier || null,
        trackingCode: form.trackingCode || null,
        trackingUrl: resolvedTrackingUrl || null,
        shippingStatus: form.shippingStatus,
        shippingLastEvent: form.shippingLastEvent || null,
        trackingToken: token,
      });
      if (!result.success) {
        alert(result.error || 'No se pudo guardar seguimiento');
        return;
      }

      if (sendOnSave && statusChanged && activeOrder.chatId && activeOrder.customerPhone) {
        const orderForMessage: Order = {
          ...activeOrder,
          trackingToken: token,
          courier: form.courier || undefined,
          trackingCode: form.trackingCode || undefined,
          trackingUrl: resolvedTrackingUrl || undefined,
          shippingStatus: form.shippingStatus,
          shippingLastEvent: form.shippingLastEvent || undefined,
        };
        const message = buildTrackingMessage(orderForMessage);
        const sent = await sendTextMessage({
          chatId: activeOrder.chatId,
          text: message,
          baileysClientId: organizationId,
          baileysTo: activeOrder.customerPhone,
        });
        const templateKey = getTemplateKeyForOrder(orderForMessage, form.shippingStatus);
        await logOrderNotification({
          organizationId,
          orderId: activeOrder.id,
          chatId: activeOrder.chatId,
          templateKey,
          status: sent.success ? 'sent' : 'failed',
          payload: {
            shippingStatus: form.shippingStatus,
            trackingCode: form.trackingCode || null,
            trackingUrl: resolvedTrackingUrl || null,
            message,
            error: sent.error || null,
            trigger: 'save_status_change',
          },
        }).catch((e) => console.error('No se pudo registrar notificación:', e));
      }

      await fetchOrders();
      if (organizationId) {
        const items = await getOrderNotifications(organizationId, activeOrder.id).catch(() => []);
        setNotifications(items);
      }
      alert('Seguimiento guardado');
    } finally {
      setSaving(false);
    }
  }, [organizationId, activeOrder, form, fetchOrders, sendOnSave, buildTrackingMessage]);

  const handleSend = useCallback(async () => {
    if (!organizationId || !activeOrder) return;
    if (!activeOrder.trackingToken) {
      alert('Primero guarda para generar el link público.');
      return;
    }
    if (!activeOrder.chatId || !activeOrder.customerPhone) {
      alert('Este pedido no tiene chat o teléfono para envío automático.');
      return;
    }
    setSending(true);
    try {
      const message = buildTrackingMessage(activeOrder);
      const sent = await sendTextMessage({
        chatId: activeOrder.chatId,
        text: message,
        baileysClientId: organizationId,
        baileysTo: activeOrder.customerPhone,
      });
      if (!sent.success) {
        await logOrderNotification({
          organizationId,
          orderId: activeOrder.id,
          chatId: activeOrder.chatId,
          templateKey: getTemplateKeyForOrder(activeOrder, form.shippingStatus),
          status: 'failed',
          payload: { message, error: sent.error || null, trigger: 'manual_send' },
        }).catch(() => null);
        alert(sent.error || 'No se pudo enviar');
        return;
      }
      await logOrderNotification({
        organizationId,
        orderId: activeOrder.id,
        chatId: activeOrder.chatId,
        templateKey: getTemplateKeyForOrder(activeOrder, form.shippingStatus),
        status: 'sent',
        payload: { message, trigger: 'manual_send' },
      }).catch(() => null);
      const items = await getOrderNotifications(organizationId, activeOrder.id).catch(() => []);
      setNotifications(items);
      alert('Seguimiento enviado al cliente');
    } finally {
      setSending(false);
    }
  }, [organizationId, activeOrder, buildTrackingMessage, form.shippingStatus]);

  const retryNotification = useCallback(async (notification: OrderNotificationItem) => {
    if (!organizationId || !activeOrder?.chatId || !activeOrder.customerPhone) {
      alert('Este pedido no tiene chat o teléfono para reintento automático.');
      return;
    }
    setRetryingNotificationId(notification.id);
    try {
      const message =
        typeof notification.payload.message === 'string' && notification.payload.message.trim()
          ? notification.payload.message
          : buildTrackingMessage(activeOrder);
      const sent = await sendTextMessage({
        chatId: activeOrder.chatId,
        text: message,
        baileysClientId: organizationId,
        baileysTo: activeOrder.customerPhone,
      });
      await logOrderNotification({
        organizationId,
        orderId: activeOrder.id,
        chatId: activeOrder.chatId,
        templateKey: notification.templateKey,
        status: sent.success ? 'sent' : 'failed',
        payload: {
          message,
          trigger: 'retry_failed',
          retryOfNotificationId: notification.id,
          error: sent.error || null,
        },
      }).catch(() => null);
      const items = await getOrderNotifications(organizationId, activeOrder.id).catch(() => []);
      setNotifications(items);
      alert(sent.success ? 'Reintento enviado correctamente.' : sent.error || 'No se pudo reenviar.');
    } finally {
      setRetryingNotificationId(null);
    }
  }, [organizationId, activeOrder, buildTrackingMessage]);

  const filteredNotifications = useMemo(() => {
    if (notificationsFilter === 'all') return notifications;
    return notifications.filter((n) => n.status === notificationsFilter);
  }, [notifications, notificationsFilter]);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 font-professional">
      <PageHeader title="Seguimiento de pedidos" description="Guías, estados, links y mensajes al cliente final" />

      <div className="rounded-ref border border-app-line bg-ref-card px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-app-muted">
          Última actualización: <span className="font-semibold text-app-ink">{lastRefreshAt ? lastRefreshAt.toLocaleTimeString('es-PE') : '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
          >
            <Loader2 size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar ahora
          </button>
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border ${
              autoRefresh ? 'bg-brand-500 text-white border-brand-500' : 'border-app-line hover:bg-app-field'
            }`}
          >
            <Truck size={13} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {slaAlerts.length > 0 && (
        <div className="rounded-ref border border-amber-200 bg-amber-50/70 shadow-sm">
          <div className="px-4 py-3 border-b border-amber-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Bandeja de alertas SLA
              </p>
              <p className="text-[12px] text-amber-800/90 mt-0.5">
                Pedidos con riesgo de atraso para tomar acción inmediata.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
              {slaAlerts.length} alerta(s)
            </span>
          </div>
          <div className="p-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {slaAlerts.map(({ order, hours, meta }) => (
              <div
                key={order.id}
                className="rounded-xl border border-amber-200 bg-white p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-app-ink">
                    {order.code || order.id.slice(0, 8)} · {order.customerName}
                  </p>
                  <p className="text-[11px] text-app-muted mt-1">
                    {order.shippingStatus ? shippingStatusLabels[order.shippingStatus] : 'Pendiente'} · {hours.toFixed(1)}h
                  </p>
                  <span className={`inline-flex mt-2 text-[10px] px-2 py-0.5 rounded-full border ${slaClassByTone[meta.tone]}`}>
                    {meta.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => focusOrderEditor(order.id)}
                  className="shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-app-line hover:bg-app-field"
                >
                  Tomar acción
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-app-ink mt-1">{orders.length}</p>
        </div>
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Pendientes</p>
          <p className="text-xl font-bold text-app-ink mt-1">{trackingMetrics.pending}</p>
        </div>
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Tránsito</p>
          <p className="text-xl font-bold text-app-ink mt-1">{trackingMetrics.in_transit}</p>
        </div>
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Agencia/Reparto</p>
          <p className="text-xl font-bold text-app-ink mt-1">
            {trackingMetrics.at_agency + trackingMetrics.out_for_delivery}
          </p>
        </div>
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Entregados</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{trackingMetrics.delivered}</p>
        </div>
        <div className="rounded-ref border border-app-line bg-ref-card p-3 shadow-sm">
          <p className="text-[11px] text-app-muted font-semibold uppercase tracking-wide">Incidencias</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{trackingMetrics.exception}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-4 items-start">
        <div className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-app-line space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido o cliente..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | NonNullable<Order['shippingStatus']>)}
              className="w-full px-3 py-2 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
            >
              <option value="all">Todos los estados</option>
              {shippingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {shippingStatusLabels[status]}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  statusFilter === 'all'
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-app-muted border-app-line hover:bg-app-field'
                }`}
              >
                Todos ({orders.length})
              </button>
              {shippingStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    statusFilter === status
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-app-muted border-app-line hover:bg-app-field'
                  }`}
                >
                  {shippingStatusLabels[status]} ({trackingMetrics[status]})
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[620px] overflow-y-auto divide-y divide-app-line">
            {loading ? (
              <div className="p-6 text-sm text-app-muted">Cargando pedidos...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-sm text-app-muted">No hay pedidos para ese filtro.</div>
            ) : (
              filteredOrders.map((order) => {
                const active = order.id === activeOrderId;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setActiveOrderId(order.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      active ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-app-field/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-app-ink">{order.code || order.id.slice(0, 8)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${slaClassByTone[getSlaMeta(order).tone]}`}>
                        {getSlaMeta(order).label}
                      </span>
                    </div>
                    <p className="text-[12px] text-app-muted truncate">{order.customerName}</p>
                    <p className="text-[11px] text-app-muted mt-1">
                      {order.shippingStatus ? shippingStatusLabels[order.shippingStatus] : 'Pendiente'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {!activeOrder ? (
          <div className="rounded-ref border border-app-line bg-ref-card p-6 shadow-sm">
            <p className="text-[14px] font-semibold text-app-ink">Selecciona un pedido</p>
            <p className="text-[13px] text-app-muted mt-1">
              Edita aquí courier, guía y mensaje de seguimiento para cliente final.
            </p>
          </div>
        ) : (
          <div
            ref={editorPanelRef}
            className={`rounded-ref border bg-ref-card overflow-hidden shadow-sm transition-[box-shadow,border-color] duration-300 ${
              highlightEditor
                ? 'border-brand-400 shadow-[0_0_0_3px_rgba(27,112,255,0.18)]'
                : 'border-app-line'
            }`}
          >
            <div className="px-5 py-4 border-b border-app-line">
              <h3 className="text-[15px] font-semibold text-app-ink">
                Pedido {activeOrder.code || activeOrder.id.slice(0, 8)} · {activeOrder.customerName}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20">
                  <PackageCheck size={12} />
                  {shippingStatusLabels[form.shippingStatus]}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${slaClassByTone[getSlaMeta(activeOrder).tone]}`}
                >
                  {getSlaMeta(activeOrder).label}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-app-field text-app-muted border border-app-line">
                  <BarChart3 size={12} />
                  Total pedido: S/ {activeOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-app-line bg-app-field/40 p-3">
                <p className="text-[12px] font-semibold text-app-ink mb-2 inline-flex items-center gap-1.5">
                  <Route size={14} />
                  Ruta del envío
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {timelineStages.map((stage, idx) => {
                    const done = idx <= activeTimelineIndex && form.shippingStatus !== 'exception';
                    return (
                      <div key={stage.key} className="text-center">
                        <div
                          className={`h-2 rounded-full ${
                            done ? 'bg-brand-500' : 'bg-app-line'
                          }`}
                        />
                        <p className={`mt-1 text-[10px] ${done ? 'text-app-ink font-semibold' : 'text-app-muted'}`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {form.shippingStatus === 'exception' && (
                  <p className="text-[11px] text-rose-600 mt-2">Este envío está marcado con incidencia.</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm text-app-muted">
                  Courier
                  <input
                    type="text"
                    list="courier-suggestions-track-page"
                    value={form.courier}
                    onChange={(e) => setForm((p) => ({ ...p, courier: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                  />
                  <datalist id="courier-suggestions-track-page">
                    {courierSuggestions.map((courier) => (
                      <option key={courier} value={courier} />
                    ))}
                  </datalist>
                </label>
                <label className="text-sm text-app-muted">
                  N° guía
                  <input
                    type="text"
                    value={form.trackingCode}
                    onChange={(e) => setForm((p) => ({ ...p, trackingCode: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                  />
                </label>
                <label className="text-sm text-app-muted sm:col-span-2">
                  Link rastreo courier
                  <div className="mt-1 flex gap-2">
                    <input
                      type="url"
                      value={form.trackingUrl}
                      onChange={(e) => setForm((p) => ({ ...p, trackingUrl: e.target.value }))}
                      className="flex-1 px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          trackingUrl: getSuggestedTrackingUrl(p.courier, p.trackingCode),
                        }))
                      }
                      className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-app-line bg-white hover:bg-app-field whitespace-nowrap"
                    >
                      Sugerir link
                    </button>
                  </div>
                </label>
                <label className="text-sm text-app-muted">
                  Estado
                  <select
                    value={form.shippingStatus}
                    onChange={(e) =>
                      setForm((p) => ({
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
                    ref={eventTextareaRef}
                    rows={2}
                    value={form.shippingLastEvent}
                    onChange={(e) => setForm((p) => ({ ...p, shippingLastEvent: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-ref-muted border border-app-line rounded-xl text-app-ink resize-none"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-app-line bg-white p-3">
                <p className="text-xs text-app-muted font-medium mb-2">Acciones rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {quickEventTemplates.map((tpl) => (
                    <button
                      key={tpl.status}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          shippingStatus: tpl.status,
                          shippingLastEvent: tpl.text,
                        }))
                      }
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border border-app-line bg-app-field hover:bg-brand-50 hover:border-brand-200"
                    >
                      {shippingStatusLabels[tpl.status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-app-line bg-app-field/50 p-3">
                <p className="text-xs text-app-muted font-medium mb-2">Link público para cliente</p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-xs text-app-ink bg-white border border-app-line px-2 py-1 rounded-md">
                    {activeOrder.trackingToken
                      ? getTrackingPublicUrl(activeOrder.trackingToken)
                      : 'Se genera al guardar'}
                  </code>
                  {activeOrder.trackingToken && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(getTrackingPublicUrl(activeOrder.trackingToken || ''));
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

              <div className="rounded-xl border border-app-line bg-white p-3">
                <p className="text-xs text-app-muted font-medium mb-2">Preview mensaje al cliente</p>
                <pre className="text-[12px] whitespace-pre-wrap leading-relaxed text-app-ink m-0 font-professional">
                  {buildTrackingMessage(activeOrder)}
                </pre>
              </div>

              <div className="rounded-xl border border-app-line bg-white p-3">
                <p className="text-xs text-app-muted font-medium mb-2">Historial de notificaciones</p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNotificationsFilter('all')}
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                      notificationsFilter === 'all'
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-app-muted border-app-line hover:bg-app-field'
                    }`}
                  >
                    Todos ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationsFilter('sent')}
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                      notificationsFilter === 'sent'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-app-muted border-app-line hover:bg-app-field'
                    }`}
                  >
                    Enviados ({notifications.filter((n) => n.status === 'sent').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationsFilter('failed')}
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                      notificationsFilter === 'failed'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-app-muted border-app-line hover:bg-app-field'
                    }`}
                  >
                    Fallidos ({notifications.filter((n) => n.status === 'failed').length})
                  </button>
                </div>
                {notificationsLoading ? (
                  <p className="text-[12px] text-app-muted">Cargando historial...</p>
                ) : filteredNotifications.length === 0 ? (
                  <p className="text-[12px] text-app-muted">Sin envíos registrados para este pedido.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredNotifications.map((n) => {
                      const toneClass =
                        n.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                          : n.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                      const trigger = typeof n.payload.trigger === 'string' ? n.payload.trigger : 'manual';
                      const triggerLabel =
                        trigger === 'save_status_change'
                          ? 'Auto al guardar'
                          : trigger === 'retry_failed'
                            ? 'Reintento'
                            : 'Envío manual';
                      const detail = typeof n.payload.error === 'string' ? n.payload.error : '';
                      return (
                        <div key={n.id} className="rounded-lg border border-app-line bg-app-field/40 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${toneClass}`}>
                              {n.status === 'sent' ? 'Enviado' : n.status === 'failed' ? 'Fallido' : 'En cola'}
                            </span>
                            <span className="text-[10px] text-app-muted">
                              {(n.sentAt || n.createdAt).toLocaleString('es-PE')}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-app-ink">
                            Plantilla: <span className="font-semibold">{n.templateKey}</span>
                          </p>
                          <p className="text-[11px] text-app-muted">
                            Origen: {triggerLabel}
                          </p>
                          {detail && <p className="text-[11px] text-rose-600 mt-0.5">{detail}</p>}
                          {n.status === 'failed' && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => void retryNotification(n)}
                                disabled={retryingNotificationId === n.id}
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-app-line bg-white hover:bg-app-field disabled:opacity-60"
                              >
                                {retryingNotificationId === n.id ? 'Reintentando...' : 'Reintentar envío'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-app-line flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(buildTrackingMessage(activeOrder));
                      alert('Mensaje copiado');
                    } catch {
                      alert('No se pudo copiar');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
                >
                  <Copy size={13} />
                  Copiar mensaje
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Enviar al cliente
                </button>
                {form.trackingUrl && (
                  <a
                    href={form.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-app-line hover:bg-app-field"
                  >
                    <ExternalLink size={13} />
                    Courier
                  </a>
                )}
              </div>
              <label className="inline-flex items-center gap-2 text-[12px] text-app-muted">
                <input
                  type="checkbox"
                  checked={sendOnSave}
                  onChange={(e) => setSendOnSave(e.target.checked)}
                  className="rounded border-app-line"
                />
                Enviar automático al guardar si cambia el estado
              </label>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Guardar seguimiento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
