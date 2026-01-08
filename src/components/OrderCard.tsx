import type { Order } from '../data/mockData';
import { formatTime } from '../data/mockData';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pendiente' };
      case 'processing':
        return { icon: Package, color: 'text-blue-600 bg-blue-100', label: 'Procesando' };
      case 'shipped':
        return { icon: Truck, color: 'text-purple-600 bg-purple-100', label: 'Enviado' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Entregado' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelado' };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl lg:rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{order.id}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{order.customerName}</p>
        </div>
        <span className={`px-2.5 lg:px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 flex-shrink-0 ml-2 ${statusConfig.color}`}>
          <StatusIcon size={12} className="lg:w-3.5 lg:h-3.5" />
          <span className="hidden sm:inline">{statusConfig.label}</span>
        </span>
      </div>

      <div className="space-y-2 mb-3 lg:mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 truncate flex-1 mr-2">
              {item.name} x{item.quantity}
            </span>
            <span className="text-gray-900 font-medium flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Creado</p>
          <p className="text-sm text-gray-700">{formatTime(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-base lg:text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

