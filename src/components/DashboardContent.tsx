import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 size={24} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen de tu negocio</p>
      </div>

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
          icon={MessageSquare}
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

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Actividad reciente</h3>
        </div>
        <div className="space-y-0">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No hay pedidos recientes</p>
          ) : (
            recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={`flex items-center justify-between py-3.5 ${
                  index > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-400' :
                        order.status === 'pending' ? 'bg-amber-400' :
                        'bg-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pedido {order.id.slice(0, 8)}…</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 text-sm">S/ {order.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{order.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
