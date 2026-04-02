import { formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';
import { MessageSquare, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderCardProps {
  order: Order;
  onOpenChat?: (chatId: string) => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string; border: string }> = {
  pending: { bg: 'bg-amber-500/12', text: 'text-amber-800', dot: 'bg-amber-500', border: 'border-amber-500/25', label: 'Pendiente' },
  processing: { bg: 'bg-brand-500/12', text: 'text-brand-800', dot: 'bg-brand-600', border: 'border-brand-500/25', label: 'Procesando' },
  completed: { bg: 'bg-emerald-500/12', text: 'text-emerald-800', dot: 'bg-emerald-600', border: 'border-emerald-500/25', label: 'Pago completado' },
  shipped: { bg: 'bg-indigo-500/12', text: 'text-indigo-800', dot: 'bg-indigo-600', border: 'border-indigo-500/25', label: 'Enviado' },
  delivered: { bg: 'bg-emerald-500/12', text: 'text-emerald-800', dot: 'bg-emerald-600', border: 'border-emerald-500/25', label: 'Entregado' },
  cancelled: { bg: 'bg-rose-500/12', text: 'text-rose-800', dot: 'bg-rose-600', border: 'border-rose-500/25', label: 'Cancelado' },
};

export default function OrderCard({ order, onOpenChat }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="rounded-[22px] border border-app-line bg-white overflow-hidden shadow-app-card font-professional h-full flex flex-col"
    >
      <div className="h-1 bg-gradient-to-r from-brand-700/45 via-brand-500/35 to-emerald-500/45 shrink-0" />

      <div className="p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-app-ink tracking-tight tabular-nums font-display leading-tight">
              {order.code || order.id.slice(0, 8)}
            </h3>
            <p className="text-[14px] text-app-muted mt-1 font-medium truncate">{order.customerName}</p>
            {order.customerDni && (
              <p className="text-[12px] text-app-muted mt-0.5 font-mono tabular-nums">DNI: {order.customerDni}</p>
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
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-app-field/80 border border-app-line">
            <MapPin size={14} className="text-app-muted shrink-0" />
            <p className="text-[12px] text-app-muted truncate leading-snug">{order.deliveryAddress}</p>
          </div>
        )}

        <div className="space-y-2.5 flex-1 min-h-0">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-baseline gap-2 text-[14px]">
              <span className="text-app-muted min-w-0">
                <span className="truncate block">{item.name}</span>
                <span className="text-app-muted/80 font-mono text-[12px]">×{item.quantity}</span>
              </span>
              <span className="text-app-ink font-semibold tabular-nums shrink-0">
                S/ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-app-line bg-app-field/40">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12px] text-app-muted font-medium shrink-0 tabular-nums">
            {formatTime(order.createdAt)}
          </span>
          {order.chatId && onOpenChat && (
            <button
              type="button"
              onClick={() => onOpenChat(order.chatId!)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-500 transition-colors shrink-0"
            >
              <MessageSquare size={14} />
              Ir al chat
            </button>
          )}
        </div>
        <span className="text-[17px] font-bold text-app-ink shrink-0 tabular-nums tracking-tight font-display">
          S/ {order.total.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}
