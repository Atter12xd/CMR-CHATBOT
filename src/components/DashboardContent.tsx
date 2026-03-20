import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Loader2,
  Activity,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import StatsCard from './StatsCard';
import PageHeader from './PageHeader';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats } from '../services/chats';
import { loadOrders } from '../services/orders';

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

export default function DashboardContent() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [totalChats, setTotalChats] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<
    { id: string; customerName: string; total: number; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [chats, orders] = await Promise.all([
        loadChats(organizationId),
        loadOrders(organizationId),
      ]);
      setTotalChats(chats.length);
      setActiveChats(chats.filter((c) => c.status === 'active').length);
      setTotalOrders(orders.length);
      setTotalRevenue(orders.reduce((sum, o) => sum + o.total, 0));
      setRecentOrders(
        orders.slice(0, 5).map((o) => ({
          id: o.id,
          customerName: o.customerName,
          total: o.total,
          status: o.status,
        }))
      );
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

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-400" />
          </div>
          <p className="text-[14px] text-slate-500">Cargando datos…</p>
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
            <p className="text-slate-400 text-[14px] leading-relaxed">
              Necesitas crear una organización para ver métricas y pedidos. Ve a{' '}
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
    <div className="flex flex-col h-full space-y-5 font-professional">
      <PageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Resumen general de tu negocio en tiempo real."
        actions={
          <motion.a
            href="/pedidos"
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-brand-500 text-white hover:bg-brand-400 border border-brand-400/30 shadow-lg shadow-brand-500/20 transition-colors"
          >
            Ver pedidos
            <ArrowRight className="size-4" />
          </motion.a>
        }
      />

      <motion.div
        variants={statsContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
      >
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard title="Total chats" value={totalChats} icon={MessageSquare} accentClassName="text-brand-400" />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard title="Chats activos" value={activeChats} icon={Activity} accentClassName="text-emerald-400" />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard title="Total pedidos" value={totalOrders} icon={ShoppingCart} accentClassName="text-amber-400" />
        </motion.div>
        <motion.div variants={statsItem} className="min-w-0">
          <StatsCard
            title="Ingresos totales"
            value={`S/ ${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            accentClassName="text-purple-400"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.08 }}
        className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card min-w-0"
      >
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-br from-brand-500/10 via-app-card to-purple-600/10 border-b border-app-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-app-line text-brand-400 shrink-0">
              <TrendingUp className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Actividad reciente</h3>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Últimos 5 pedidos</p>
            </div>
          </div>
          {recentOrders.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.05] border border-app-line px-3 py-1.5 rounded-xl tabular-nums w-fit">
              {recentOrders.length} pedidos
            </span>
          )}
        </div>

        <div className="divide-y divide-app-line">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-600/15 border border-brand-500/20 flex items-center justify-center mb-4">
                <ShoppingCart className="size-7 text-slate-500" />
              </div>
              <p className="text-[15px] font-medium text-slate-300">No hay pedidos recientes</p>
              <p className="text-[13px] text-slate-500 mt-1 text-center max-w-sm">
                Cuando recibas pedidos aparecerán aquí con el total y el estado.
              </p>
            </div>
          ) : (
            recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="show"
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-brand-400/40 to-purple-600/30 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-app-card flex items-center justify-center border border-app-line">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          order.status === 'delivered' || order.status === 'completed'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                            : order.status === 'pending'
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]'
                              : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-[15px] truncate leading-snug">
                      {order.customerName}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white text-[15px] tabular-nums font-display">
                    S/ {order.total.toFixed(2)}
                  </p>
                  <p
                    className={`text-[12px] mt-0.5 font-semibold capitalize ${
                      order.status === 'delivered' || order.status === 'completed'
                        ? 'text-emerald-400'
                        : order.status === 'pending'
                          ? 'text-amber-400'
                          : 'text-slate-500'
                    }`}
                  >
                    {order.status === 'pending'
                      ? 'Pendiente'
                      : order.status === 'completed'
                        ? 'Completado'
                        : order.status === 'delivered'
                          ? 'Entregado'
                          : order.status}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
