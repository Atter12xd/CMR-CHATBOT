import { formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';


interface OrderCardProps {
  order: Order;
}


const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
  processing: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Procesando' },
  shipped: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', label: 'Enviado' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Entregado' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Cancelado' },
};


export default function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{order.id}</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">{order.customerName}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
        </div>


        <div className="space-y-1.5 mb-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-[13px]">
              <span className="text-slate-500">
                {item.name} <span className="text-slate-400">x{item.quantity}</span>
              </span>
              <span className="text-slate-800 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-100">
        <span className="text-[12px] text-slate-400">{formatTime(order.createdAt)}</span>
        <span className="text-base font-bold text-slate-900">${order.total.toFixed(2)}</span>
      </div>
    </div>
  );
}