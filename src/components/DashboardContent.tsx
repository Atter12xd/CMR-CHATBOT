import { MessageSquare, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import { mockChats, mockOrders } from '../data/mockData';

export default function DashboardContent() {
  // Calcular métricas
  const totalChats = mockChats.length;
  const activeChats = mockChats.filter(c => c.status === 'active').length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Resumen de tu negocio</p>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {mockOrders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="text-sm text-gray-500">Pedido {order.id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500 capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
