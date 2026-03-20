import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShoppingCart, DollarSign, Loader2, Activity, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import PageHeader from './PageHeader';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats } from '../services/chats';
import { loadOrders } from '../services/orders';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-400" />
          </div>
          <p className="text-[13px] text-slate-500">Cargando datos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Resumen general de tu negocio en tiempo real."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total chats" value={totalChats} change="" icon={MessageSquare} />
        <StatsCard title="Chats activos" value={activeChats} change="" icon={Activity} />
        <StatsCard title="Total pedidos" value={totalOrders} change="" icon={ShoppingCart} />
        <StatsCard
          title="Ingresos totales"
          value={`S/ ${totalRevenue.toFixed(2)}`}
          change=""
          icon={DollarSign}
        />
      </div>

      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-line">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white font-display">Actividad reciente</h3>
              <p className="text-[11px] text-slate-500">Últimos 5 pedidos</p>
            </div>
          </div>
          {recentOrders.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.04] border border-app-line px-2.5 py-1 rounded-lg tabular-nums">
              {recentOrders.length} pedidos
            </span>
          )}
        </div>

        <div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-app-line flex items-center justify-center mb-3">
                <ShoppingCart size={20} className="text-slate-500" />
              </div>
              <p className="text-[13px] text-slate-500">No hay pedidos recientes</p>
            </div>
          ) : (
            recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors ${
                  index > 0 ? 'border-t border-app-line' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-app-line flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-400'
                          : order.status === 'pending'
                            ? 'bg-amber-400'
                            : order.status === 'completed'
                              ? 'bg-emerald-400'
                              : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-[13px] truncate">{order.customerName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-[14px] tabular-nums">
                    S/ {order.total.toFixed(2)}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 font-semibold capitalize ${
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
