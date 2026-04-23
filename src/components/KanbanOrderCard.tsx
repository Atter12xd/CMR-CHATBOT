import type { Order } from '../data/mockData';
import { MapPin, MessageSquare, Truck, ShoppingBag, Clock, AlertCircle } from 'lucide-react';

function formatRelativeOrderEs(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${days} d`;
}

function cityFromAddress(addr?: string): string {
  if (!addr?.trim()) return '—';
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || '—';
}

function initialsFromName(name?: string): string {
  if (!name?.trim()) return '·';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '·';
}

/** Hash determinista para color por cliente */
function colorFromString(input: string): { bg: string; text: string } {
  const palette = [
    { bg: '#E0F2FE', text: '#0369A1' },
    { bg: '#FCE7F3', text: '#9D174D' },
    { bg: '#DCFCE7', text: '#15803D' },
    { bg: '#FEF3C7', text: '#92400E' },
    { bg: '#EDE9FE', text: '#5B21B6' },
    { bg: '#FFE4E6', text: '#9F1239' },
    { bg: '#CFFAFE', text: '#155E75' },
    { bg: '#F1F5F9', text: '#334155' },
  ];
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

interface KanbanOrderCardProps {
  order: Order;
  onOpenChat?: (chatId: string) => void;
  onOpenTracking?: (order: Order) => void;
}

export default function KanbanOrderCard({ order, onOpenChat, onOpenTracking }: KanbanOrderCardProps) {
  const code = order.code || `#${order.id.slice(0, 8).toUpperCase()}`;
  const first = order.items[0];
  const productLine =
    order.items.length === 0 || !first ? '—' : first.name;
  const extraItems = Math.max(0, order.items.length - 1);
  const totalUnits = order.items.reduce((s, i) => s + (i.quantity || 1), 0);
  const avatarColor = colorFromString(order.customerName || order.id);
  const initials = initialsFromName(order.customerName);

  const shipping = order.shippingStatus;
  const hasTracking = Boolean(order.trackingCode);

  return (
    <div className="group relative bg-white border border-[#E6E6EC] rounded-xl px-3 pt-2.5 pb-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] hover:border-[#CDD3DC] transition-[box-shadow,border-color,transform,opacity] hover:-translate-y-px cursor-grab active:cursor-grabbing font-professional select-none">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold tracking-tight ring-1 ring-white shadow-sm"
            style={{ background: avatarColor.bg, color: avatarColor.text }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[10px] font-bold text-[#1B70FF] tabular-nums tracking-tight truncate">{code}</div>
            <div className="text-[9.5px] text-[#9B9BA3] tabular-nums mt-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" strokeWidth={2.25} aria-hidden />
              {formatRelativeOrderEs(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          {order.chatId && onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(order.chatId!);
              }}
              className="shrink-0 w-6 h-6 grid place-items-center rounded-md text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7] ring-1 ring-[#86EFAC]/40"
              title="Abrir chat de WhatsApp"
              aria-label="Abrir chat"
            >
              <MessageSquare className="w-3 h-3" strokeWidth={2.25} />
            </button>
          )}
          {onOpenTracking && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTracking(order);
              }}
              className="shrink-0 w-6 h-6 grid place-items-center rounded-md text-[#7C3AED] bg-[#F5F3FF] hover:bg-[#EDE9FE] ring-1 ring-[#C4B5FD]/40"
              title="Seguimiento"
              aria-label="Seguimiento"
            >
              <Truck className="w-3 h-3" strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>

      <p className="text-[12.5px] font-semibold text-[#1F1F23] truncate leading-snug mt-2">
        {order.customerName || 'Cliente sin nombre'}
      </p>
      <p className="text-[10.5px] text-[#6D6D70] truncate mt-0.5 tabular-nums">
        {order.customerPhone || '—'}
      </p>

      <div className="mt-2 flex items-center gap-1.5 min-w-0">
        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F4F4F6] text-[#3D3D40] text-[10px] font-bold tabular-nums leading-none">
          <ShoppingBag className="w-2.5 h-2.5" strokeWidth={2.25} aria-hidden />
          {totalUnits}
        </span>
        <p className="text-[11px] text-[#5C5C63] truncate" title={`${productLine}${extraItems ? ` + ${extraItems} más` : ''}`}>
          {productLine}
          {extraItems > 0 && <span className="text-[#9B9BA3]"> · +{extraItems}</span>}
        </p>
      </div>

      {(shipping || hasTracking) && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {hasTracking && order.courier && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F5F3FF] text-[#6D28D9] text-[9.5px] font-bold ring-1 ring-[#C4B5FD]/60 max-w-[160px]">
              <Truck className="w-2.5 h-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="truncate">{order.courier}</span>
            </span>
          )}
          {shipping === 'in_transit' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] text-[9.5px] font-bold ring-1 ring-[#BFDBFE]/70">
              <Truck className="w-2.5 h-2.5" strokeWidth={2.5} aria-hidden />
              En tránsito
            </span>
          )}
          {shipping === 'out_for_delivery' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] text-[9.5px] font-bold ring-1 ring-[#FDE68A]/70">
              <Truck className="w-2.5 h-2.5" strokeWidth={2.5} aria-hidden />
              En reparto
            </span>
          )}
          {shipping === 'exception' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FEF2F2] text-[#B91C1C] text-[9.5px] font-bold ring-1 ring-[#FCA5A5]/60">
              <AlertCircle className="w-2.5 h-2.5" strokeWidth={2.5} aria-hidden />
              Incidencia
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-dashed border-[#EFEFF1] flex items-center justify-between gap-2 min-w-0">
        <span className="text-[12.5px] font-bold text-[#1F1F23] tabular-nums leading-none shrink-0">
          S/ {order.total.toFixed(2)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-[#9B9BA3] min-w-0 justify-end max-w-[58%]">
          <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" strokeWidth={2.25} aria-hidden />
          <span className="truncate">{cityFromAddress(order.deliveryAddress)}</span>
        </span>
      </div>
    </div>
  );
}
