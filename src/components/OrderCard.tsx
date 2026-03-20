import { formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';
import { MessageSquare, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderCardProps {
  order: Order;
  onOpenChat?: (chatId: string) => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string; border: string }> = {
  pending: { bg: 'bg-amber-500/12', text: 'text-amber-400', dot: 'bg-amber-400', border: 'border-amber-500/25', label: 'Pendiente' },
  processing: { bg: 'bg-sky-500/12', text: 'text-sky-400', dot: 'bg-sky-400', border: 'border-sky-500/25', label: 'Procesando' },
  completed: { bg: 'bg-emerald-500/12', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/25', label: 'Pago completado' },
  shipped: { bg: 'bg-indigo-500/12', text: 'text-indigo-400', dot: 'bg-indigo-400', border: 'border-indigo-500/25', label: 'Enviado' },
  delivered: { bg: 'bg-emerald-500/12', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/25', label: 'Entregado' },
  cancelled: { bg: 'bg-rose-500/12', text: 'text-rose-400', dot: 'bg-rose-400', border: 'border-rose-500/25', label: 'Cancelado' },
};

export default function OrderCard({ order, onOpenChat }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card font-professional h-full flex flex-col"
    >
      <div className="h-1 bg-gradient-to-r from-brand-500/50 via-purple-500/40 to-emerald-500/35 shrink-0" />

      <div className="p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-white tracking-tight tabular-nums font-display leading-tight">
              {order.code || order.id.slice(0, 8)}
            </h3>
            <p className="text-[14px] text-slate-400 mt-1 font-medium truncate">{order.customerName}</p>
            {order.customerDni && (
              <p className="text-[12px] text-slate-500 mt-0.5 font-mono tabular-nums">DNI: {order.customerDni}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 border ${status.bg} ${status.text} ${status.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {order.deliveryAddress && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/[0.04] border border-app-line">
            <MapPin size={14} className="text-slate-500 shrink-0" />
            <p className="text-[12px] text-slate-400 truncate leading-snug">{order.deliveryAddress}</p>
          </div>
        )}

        <div className="space-y-2.5 flex-1 min-h-0">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-baseline gap-2 text-[14px]">
              <span className="text-slate-400 min-w-0">
                <span className="truncate block">{item.name}</span>
                <span className="text-slate-500 font-mono text-[12px]">×{item.quantity}</span>
              </span>
              <span className="text-slate-200 font-semibold tabular-nums shrink-0">
                S/ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-app-line bg-white/[0.02]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12px] text-slate-500 font-medium shrink-0 tabular-nums">
            {formatTime(order.createdAt)}
          </span>
          {order.chatId && onOpenChat && (
            <button
              type="button"
              onClick={() => onOpenChat(order.chatId!)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-400 hover:text-brand-300 transition-colors shrink-0"
            >
              <MessageSquare size={14} />
              Ir al chat
            </button>
          )}
        </div>
        <span className="text-[17px] font-bold text-white shrink-0 tabular-nums tracking-tight font-display">
          S/ {order.total.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}
