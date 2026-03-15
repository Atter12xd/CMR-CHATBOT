import { formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';
import { MessageSquare, MapPin } from 'lucide-react';


interface OrderCardProps {
  order: Order;
  onOpenChat?: (chatId: string) => void;
}


const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string; border: string }> = {
  pending:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400',   border: 'border-amber-500/20', label: 'Pendiente' },
  processing: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400',    border: 'border-blue-500/20',  label: 'Procesando' },
  completed:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20', label: 'Pago completado' },
  shipped:    { bg: 'bg-sky-500/10',     text: 'text-sky-400',     dot: 'bg-sky-400',     border: 'border-sky-500/20',   label: 'Enviado' },
  delivered:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20', label: 'Entregado' },
  cancelled:  { bg: 'bg-rose-500/10',    text: 'text-rose-400',    dot: 'bg-rose-400',    border: 'border-rose-500/20',  label: 'Cancelado' },
};


export default function OrderCard({ order, onOpenChat }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-white tracking-tight tabular-nums">
              {order.code || order.id.slice(0, 8)}
            </h3>
            <p className="text-[13px] text-slate-400 mt-0.5 font-medium">{order.customerName}</p>
            {order.customerDni && (
              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">DNI: {order.customerDni}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${status.bg} ${status.text} ${status.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {order.deliveryAddress && (
          <div className="flex items-center gap-1.5 mb-3.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
            <MapPin size={12} className="text-slate-600 flex-shrink-0" />
            <p className="text-[11px] text-slate-500 truncate">{order.deliveryAddress}</p>
          </div>
        )}

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-[13px]">
              <span className="text-slate-400">
                {item.name}{' '}
                <span className="text-slate-600 font-mono">x{item.quantity}</span>
              </span>
              <span className="text-slate-300 font-semibold tabular-nums">
                S/ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.04] bg-white/[0.02]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] text-slate-600 font-medium shrink-0">
            {formatTime(order.createdAt)}
          </span>
          {order.chatId && onOpenChat && (
            <button
              type="button"
              onClick={() => onOpenChat(order.chatId!)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0"
            >
              <MessageSquare size={13} />
              Ir al chat
            </button>
          )}
        </div>
        <span className="text-[16px] font-extrabold text-white shrink-0 tabular-nums tracking-tight">
          S/ {order.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
