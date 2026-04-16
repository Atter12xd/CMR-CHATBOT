import type { Order } from '../data/mockData';
import { MapPin, MessageSquare } from 'lucide-react';

function formatRelativeOrderEs(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? '' : 's'}`;
  return `hace ${days} día${days === 1 ? '' : 's'}`;
}

function cityFromAddress(addr?: string): string {
  if (!addr?.trim()) return '—';
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || '—';
}

interface KanbanOrderCardProps {
  order: Order;
  onOpenChat?: (chatId: string) => void;
}

/** Tarjeta alineada con `wazapp-standalone.html` `.order-card` */
export default function KanbanOrderCard({ order, onOpenChat }: KanbanOrderCardProps) {
  const code = order.code || `#${order.id.slice(0, 8)}`;
  const first = order.items[0];
  const productLine =
    order.items.length === 0 || !first
      ? '—'
      : order.items.length === 1
        ? first.name
        : `${first.name} +${order.items.length - 1} más`;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[6px] px-[11px] py-2.5 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,.07)] transition-[box-shadow,opacity] cursor-grab active:cursor-grabbing font-professional select-none">
      <div className="flex items-start justify-between gap-1 mb-0.5 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-[#1B70FF] leading-tight">{code}</div>
          <div className="text-[10px] text-[#B8B8BB] mt-0.5 tabular-nums">{formatRelativeOrderEs(order.createdAt)}</div>
        </div>
        {order.chatId && onOpenChat && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat(order.chatId!);
            }}
            className="shrink-0 p-1 rounded-md text-[#1B70FF] hover:bg-[#EBF2FF]/80 border border-transparent hover:border-[#1B70FF]/15"
            title="Abrir chat"
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
      <p className="text-xs font-semibold text-[#3D3D40] truncate leading-snug mt-1.5">{order.customerName}</p>
      <p className="text-[11px] text-[#6D6D70] truncate mt-0.5">{order.customerPhone || '—'}</p>
      <p className="text-[11px] text-[#6D6D70] truncate mt-1 mb-1.5" title={productLine}>
        {productLine}
      </p>
      <div className="flex justify-between items-center gap-2 min-w-0">
        <span className="text-xs font-bold text-[#3D3D40] tabular-nums shrink-0">S/ {order.total.toFixed(2)}</span>
        <span className="flex items-center gap-0.5 text-[10px] text-[#B8B8BB] min-w-0 justify-end max-w-[55%]">
          <MapPin className="w-3 h-3 text-rose-400 shrink-0" aria-hidden />
          <span className="truncate">{cityFromAddress(order.deliveryAddress)}</span>
        </span>
      </div>
    </div>
  );
}
