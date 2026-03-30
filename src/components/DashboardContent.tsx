import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Loader2,
  Activity,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import StatsCard from './StatsCard';
import WeeklyChart from './WeeklyChart';
import type { DayData } from './WeeklyChart';
import PageHeader from './PageHeader';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats } from '../services/chats';
import { loadOrders } from '../services/orders';
import type { Chat } from '../data/mockData';
import type { Order } from '../data/mockData';

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

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 400, damping: 32 },
  }),
};

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getWeekRange(date: Date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function formatPeriodLabel(date: Date) {
  const { start, end } = getWeekRange(date);
  const sDay = start.getDate().toString().padStart(2, '0');
  const eDay = end.getDate().toString().padStart(2, '0');
  const sMonth = MONTHS_ES[start.getMonth()];
  const eMonth = MONTHS_ES[end.getMonth()];
  const yr = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${sDay} – ${eDay} ${sMonth}. ${yr}`;
  }
  return `${sDay} ${sMonth}. – ${eDay} ${eMonth}. ${yr}`;
}

function buildWeeklyData(
  chats: Chat[],
  orders: Order[],
  refDate: Date
): DayData[] {
  const { start } = getWeekRange(refDate);
  const days: DayData[] = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const chatCount = chats.filter((c) => {
      const t = new Date(c.lastMessageTime);
      return t >= dayStart && t <= dayEnd;
    }).length;

    const orderCount = orders.filter((o) => {
      const t = new Date(o.createdAt);
      return t >= dayStart && t <= dayEnd;
    }).length;

    days.push({
      label: DAYS_SHORT[dayStart.getDay()],
      chats: chatCount,
      orders: orderCount,
    });
  }
  return days;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return map[status] || status;
}

function statusConfig(status: string) {
  switch (status) {
    case 'delivered':
    case 'completed':
      return {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: CheckCircle2,
      };
    case 'pending':
      return {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: Clock,
      };
    case 'cancelled':
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertCircle,
      };
    default:
      return {
        color: 'text-app-muted',
        bg: 'bg-app-field',
        border: 'border-app-line',
        icon: Clock,
      };
  }
}

export default function DashboardContent() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [periodDate, setPeriodDate] = useState(() => new Date());

  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [chats, orders] = await Promise.all([
        loadChats(organizationId),
        loadOrders(organizationId),
      ]);
      setAllChats(chats);
      setAllOrders(orders);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [organizationId, fetchData]);

  const totalChats = allChats.length;
  const activeChats = allChats.filter((c) => c.status === 'active').length;
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);

  const weeklyData = useMemo(
    () => buildWeeklyData(allChats, allOrders, periodDate),
    [allChats, allOrders, periodDate]
  );

  const recentOrders = useMemo(() => allOrders.slice(0, 6), [allOrders]);

  const handlePrev = () =>
    setPeriodDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 7);
      return n;
    });

  const handleNext = () =>
    setPeriodDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 7);
      if (n > new Date()) return d;
      return n;
    });

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-app-muted">Cargando datos…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader
          eyebrow="Resumen"
          title="Dashboard"
          description="Resumen general de tu negocio en tiempo real."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-app-muted text-[14px] leading-relaxed">
              Necesitas crear una organización para ver métricas y pedidos. Ve a{' '}
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
      <PageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Resumen general de tu negocio en tiempo real."
        actions={
          <motion.a
            href="/pedidos"
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold bg-app-charcoal text-white hover:bg-black shadow-md shadow-black/10 transition-colors"
          >
            Ver pedidos
            <ArrowRight className="size-4" />
          </motion.a>
        }
      />

      {/* Period selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-white border border-app-line rounded-full px-4 py-2 shadow-app-card">
          <CalendarDays className="size-4 text-brand-500" />
          <span className="text-[13px] font-semibold text-app-ink">Período:</span>
          <button
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-app-field transition-colors"
          >
            <ChevronLeft className="size-4 text-app-muted" />
          </button>
          <span className="text-[13px] font-semibold text-app-ink tabular-nums min-w-[160px] text-center">
            {formatPeriodLabel(periodDate)}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-app-field transition-colors"
          >
            <ChevronRight className="size-4 text-app-muted" />
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={statsContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
      >
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard
            title="Total chats"
            value={totalChats}
            icon={MessageSquare}
            accentClassName="text-blue-600"
            iconBg="bg-blue-50"
          />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard
            title="Chats activos"
            value={activeChats}
            icon={Activity}
            accentClassName="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard
            title="Total pedidos"
            value={totalOrders}
            icon={ShoppingCart}
            accentClassName="text-amber-600"
            iconBg="bg-amber-50"
          />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard
            title="Ingresos totales"
            value={`S/ ${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            accentClassName="text-violet-600"
            iconBg="bg-violet-50"
          />
        </motion.div>
      </motion.div>

      {/* Chart + Recent orders row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Weekly chart card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="xl:col-span-3 rounded-[24px] border border-app-line bg-white overflow-hidden shadow-app-card"
        >
          <div className="px-5 py-4 sm:px-6 border-b border-app-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-app-field text-app-charcoal shrink-0">
                <TrendingUp className="size-[18px]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-app-ink tracking-tight">
                  Actividad semanal
                </h3>
                <p className="text-[12px] text-app-muted mt-0.5 font-medium">
                  Chats y pedidos por día
                </p>
              </div>
            </div>
          </div>
          <div className="px-5 py-6 sm:px-6">
            <WeeklyChart data={weeklyData} />
          </div>
        </motion.div>

        {/* Recent orders card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="xl:col-span-2 rounded-[24px] border border-app-line bg-white overflow-hidden shadow-app-card flex flex-col"
        >
          <div className="px-5 py-4 sm:px-6 border-b border-app-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-app-field text-app-charcoal shrink-0">
                <ShoppingCart className="size-[18px]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-app-ink tracking-tight">
                  Pedidos recientes
                </h3>
                <p className="text-[12px] text-app-muted mt-0.5 font-medium">
                  Últimos {recentOrders.length}
                </p>
              </div>
            </div>
            {recentOrders.length > 0 && (
              <a
                href="/pedidos"
                className="text-[12px] font-semibold text-brand-600 hover:text-brand-500 transition-colors"
              >
                Ver todos
              </a>
            )}
          </div>

          <div className="flex-1 divide-y divide-app-line overflow-y-auto max-h-[370px]">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-14 h-14 rounded-2xl bg-app-field border border-app-line flex items-center justify-center mb-4">
                  <ShoppingCart className="size-6 text-app-muted" />
                </div>
                <p className="text-[14px] font-medium text-app-ink">No hay pedidos</p>
                <p className="text-[12px] text-app-muted mt-1 text-center">
                  Cuando recibas pedidos aparecerán aquí.
                </p>
              </div>
            ) : (
              recentOrders.map((order, index) => {
                const sc = statusConfig(order.status);
                const StatusIcon = sc.icon;
                return (
                  <motion.div
                    key={order.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6 hover:bg-app-field/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-xl ${sc.bg} border ${sc.border} shrink-0`}>
                        <StatusIcon className={`size-4 ${sc.color}`} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-app-ink text-[14px] truncate leading-snug">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-app-muted mt-0.5 font-mono tabular-nums">
                          #{order.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-app-ink text-[14px] tabular-nums font-display">
                        S/ {order.total.toFixed(2)}
                      </p>
                      <p className={`text-[11px] mt-0.5 font-semibold capitalize ${sc.color}`}>
                        {statusLabel(order.status)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
