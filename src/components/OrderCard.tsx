import { formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';

interface OrderCardProps {
  order: Order;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{order.id}</h3>
          <p className="text-sm text-gray-600">{order.customerName}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.name} x{item.quantity}
            </span>
            <span className="text-gray-900 font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
        <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
