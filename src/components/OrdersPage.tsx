import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { loadOrders } from '../services/orders';
import type { Order } from '../data/mockData';
import OrderCard from './OrderCard';


type OrderStatus = Order['status'] | 'all';


const statusLabels: Record<string, string> = {
  all: 'Todos',
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};


export default function OrdersPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  const fetchOrders = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const list = await loadOrders(organizationId);
      setOrders(list);
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

  const statuses: OrderStatus[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 size={24} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="text-sm text-slate-500 p-4">
        Crea o selecciona una organización para ver pedidos.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gestión</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pedidos</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona todos tus pedidos</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-150 ${
              selectedStatus === status
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {statusLabels[status] || status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-violet-600" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            {selectedStatus === 'all' ? 'No hay pedidos aún' : 'No hay pedidos con este estado'}
          </p>
        </div>
      )}
    </div>
  );
}
