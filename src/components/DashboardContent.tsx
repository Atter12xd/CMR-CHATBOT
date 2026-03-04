import { MessageSquare, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import { mockChats, mockOrders } from '../data/mockData';


export default function DashboardContent() {
  const totalChats = mockChats.length;
  const activeChats = mockChats.filter(c => c.status === 'active').length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen de tu negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Chats"
          value={totalChats}
          change="+12% vs mes anterior"
          icon={MessageSquare}
          color="primary"
        />
        <StatsCard
          title="Chats Activos"
          value={activeChats}
          change="+5% vs mes anterior"
          icon={MessageSquare}
          color="green"
        />
        <StatsCard
          title="Total Pedidos"
          value={totalOrders}
          change="+8% vs mes anterior"
          icon={ShoppingCart}
          color="yellow"
        />
        <StatsCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toFixed(2)}`}
          change="+15% vs mes anterior"
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Actividad reciente</h3>
        </div>
        <div className="space-y-0">
          {mockOrders.slice(0, 5).map((order, index) => (
            <div
              key={order.id}
              className={`flex items-center justify-between py-3.5 ${
                index > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'completed' ? 'bg-emerald-400' :
                    order.status === 'pending' ? 'bg-amber-400' :
                    'bg-slate-300'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{order.customerName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Pedido {order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 text-sm">${order.total.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}