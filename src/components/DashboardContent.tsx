import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShoppingCart, DollarSign, Loader2, TrendingUp, Activity } from 'lucide-react';
import StatsCard from './StatsCard';
import { useOrganization } from '../hooks/useOrganization';
import { loadChats } from '../services/chats';
import { loadOrders } from '../services/orders';


export default function DashboardContent() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [totalChats, setTotalChats] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<{ id: string; customerName: string; total: number; status: string }[]>([]);
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
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm text-slate-500">Cargando datos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-blue-500" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Overview
          </p>
        </div>
        <h2 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">
          Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Resumen general de tu negocio en tiempo real
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Chats"
          value={totalChats}
          change=""
          icon={MessageSquare}
          color="primary"
        />
        <StatsCard
          title="Chats Activos"
          value={activeChats}
          change=""
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Total Pedidos"
          value={totalOrders}
          change=""
          icon={ShoppingCart}
          color="yellow"
        />
        <StatsCard
          title="Ingresos Totales"
          value={`S/ ${totalRevenue.toFixed(2)}`}
          change=""
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-[#111827] rounded-2xl border border-slate-700/50 p-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Actividad reciente</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Últimos 5 pedidos</p>
            </div>
          </div>
          {recentOrders.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/50">
              {recentOrders.length} pedidos
            </span>
          )}
        </div>

        <div className="space-y-0">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center mb-3">
                <ShoppingCart size={20} className="text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">No hay pedidos recientes</p>
            </div>
          ) : (
            recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={`group flex items-center justify-between py-4 px-3 -mx-3 rounded-xl transition-colors hover:bg-slate-800/50 ${
                  index > 0 ? 'border-t border-slate-700/30' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0 group-hover:border-slate-600/50 transition-colors">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/40'
                          : order.status === 'pending'
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/40'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm tabular-nums">
                    S/ {order.total.toFixed(2)}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 font-medium capitalize ${
                      order.status === 'delivered'
                        ? 'text-emerald-400'
                        : order.status === 'pending'
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {order.status}
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