import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import PageHeader from './PageHeader';
import { useOrganization } from '../hooks/useOrganization';
import { useAuth } from '../hooks/useAuth';
import { loadChats } from '../services/chats';
import { loadOrders } from '../services/orders';
import type { Order } from '../data/mockData';
import type { Chat } from '../data/mockData';

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function formatRelativeEs(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? 's' : ''}`;
}

const STATUS_ORDER: Order['status'][] = [
  'pending',
  'processing',
  'completed',
  'shipped',
  'delivered',
  'cancelled',
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Pago ok',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function DashboardContent() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [c, o] = await Promise.all([loadChats(organizationId), loadOrders(organizationId)]);
      setChats(c);
      setOrders(o);
    } catch (err) {
      console.error('Dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [organizationId, fetchData]);

  const metrics = useMemo(() => {
    const totalPedidos = orders.length;
    const pendientes = orders.filter((x) => x.status === 'pending').length;
    const confirmadosHoy = orders.filter(
      (x) =>
        (x.status === 'completed' || x.status === 'delivered') && isToday(x.createdAt)
    ).length;
    const totalChats = chats.length;
    const conBot = chats.filter((c) => c.botActive).length;
    const tasaIa = totalChats > 0 ? Math.round((conBot / totalChats) * 100) : 0;
    const unread = chats.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const abiertas = chats.filter((c) => c.status === 'active').length;
    const counts: Record<string, number> = {};
    for (const s of STATUS_ORDER) counts[s] = 0;
    for (const o of orders) {
      if (counts[o.status] != null) counts[o.status]++;
    }
    const maxBar = Math.max(1, ...Object.values(counts));
    return {
      totalPedidos,
      pendientes,
      confirmadosHoy,
      tasaIa,
      tasaIaSub: `${conBot} de ${totalChats} chats`,
      unread,
      abiertas,
      totalChats,
      counts,
      maxBar,
    };
  }, [chats, orders]);

  const activity = useMemo(() => {
    const items: { dot: string; html: ReactNode; time: string; t: number }[] = [];
    for (const o of [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6)) {
      const code = o.code || `#${o.id.slice(0, 6)}`;
      if (o.status === 'delivered' || o.status === 'completed') {
        items.push({
          dot: '#14B8A6',
          html: (
            <>
              Pedido <strong>{code}</strong> {o.status === 'delivered' ? 'entregado' : 'confirmado'}
            </>
          ),
          time: formatRelativeEs(o.createdAt),
          t: o.createdAt.getTime(),
        });
      } else if (o.status === 'pending') {
        items.push({
          dot: '#F59E0B',
          html: (
            <>
              Pedido <strong>{code}</strong> pendiente de confirmación
            </>
          ),
          time: formatRelativeEs(o.createdAt),
          t: o.createdAt.getTime(),
        });
      } else {
        items.push({
          dot: '#1B70FF',
          html: (
            <>
              Pedido <strong>{code}</strong> actualizado
            </>
          ),
          time: formatRelativeEs(o.createdAt),
          t: o.createdAt.getTime(),
        });
      }
    }
    for (const ch of [...chats].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()).slice(0, 4)) {
      items.push({
        dot: '#1B70FF',
        html: (
          <>
            Nueva conversación con <strong>{ch.customerName}</strong>
          </>
        ),
        time: formatRelativeEs(ch.lastMessageTime),
        t: ch.lastMessageTime.getTime(),
      });
    }
    return items
      .sort((a, b) => b.t - a.t)
      .slice(0, 8)
      .map(({ dot, html, time }) => ({ dot, html, time }));
  }, [orders, chats]);

  const userInitials = () => {
    const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'U';
    return name
      .split(/\s+/)
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-[#6D6D70]">Cargando datos…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader title="Dashboard" description="Resumen general de operaciones" />
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
          <p className="text-[13px] text-[#6D6D70]">
            Crea una organización en{' '}
            <a href="/configuracion" className="text-brand-600 font-semibold hover:underline">
              Configuración
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-professional">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <PageHeader title="Dashboard" description="Resumen general de operaciones" />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-emerald-500 shrink-0 self-start mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Sistema activo
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,.08)] flex items-center gap-3.5 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,.07)] transition-shadow">
          <div className="w-[42px] h-[42px] rounded-[10px] bg-[#EBF2FF] text-brand-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-[#1a1a1c] leading-none tabular-nums">{metrics.totalPedidos}</div>
            <div className="text-xs font-medium text-[#6D6D70] mt-0.5">Total Pedidos</div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,.08)] flex items-center gap-3.5">
          <div className="w-[42px] h-[42px] rounded-[10px] bg-[#FFFBEB] text-amber-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-[#1a1a1c] leading-none tabular-nums">{metrics.pendientes}</div>
            <div className="text-xs font-medium text-[#6D6D70] mt-0.5">Pendientes</div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,.08)] flex items-center gap-3.5">
          <div className="w-[42px] h-[42px] rounded-[10px] bg-[#ECFDF5] text-emerald-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-[#1a1a1c] leading-none tabular-nums">{metrics.confirmadosHoy}</div>
            <div className="text-xs font-medium text-[#6D6D70] mt-0.5">Confirmados Hoy</div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,.08)] flex items-center gap-3.5">
          <div className="w-[42px] h-[42px] rounded-[10px] bg-[#F5F3FF] text-violet-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[26px] font-extrabold text-[#1a1a1c] leading-none tabular-nums">{metrics.tasaIa}%</div>
            <div className="text-xs font-medium text-[#6D6D70] mt-0.5">Tasa IA</div>
            <div className="text-[11px] text-[#B8B8BB] mt-0.5">{metrics.tasaIaSub}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,.08)] overflow-hidden">
          <div className="px-[18px] py-3 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[#3D3D40]">Pedidos por Estado</h3>
          </div>
          <div className="p-4 space-y-3">
            {STATUS_ORDER.map((st) => {
              const n = metrics.counts[st] || 0;
              const pct = Math.round((n / metrics.maxBar) * 100);
              return (
                <div key={st}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#6D6D70]">{STATUS_LABEL[st]}</span>
                    <span className="font-semibold text-[#3D3D40] tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,.08)] overflow-hidden">
          <div className="px-[18px] py-3 border-b border-[#E5E7EB]">
            <h3 className="text-[13px] font-semibold text-[#3D3D40]">Equipo</h3>
          </div>
          <div className="p-4 space-y-0">
            <div className="flex items-center gap-3 py-2.5 border-b border-[#f3f4f6]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                style={{ background: '#1B70FF' }}
              >
                {userInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#3D3D40] truncate">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
                </div>
                <div className="text-[11px] text-[#6D6D70]">Administrador</div>
              </div>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-emerald-500 shrink-0">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-[#B8B8BB] pt-3">Tu organización (propietario). Invita a más colaboradores cuando esté disponible.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,.08)] overflow-hidden">
          <div className="px-[18px] py-3 border-b border-[#E5E7EB]">
            <h3 className="text-[13px] font-semibold text-[#3D3D40]">Actividad Reciente</h3>
          </div>
          <div className="p-4 max-h-[320px] overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-[13px] text-[#6D6D70]">Sin actividad reciente.</p>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[#f3f4f6] last:border-0">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.dot }} />
                  <div className="text-[13px] text-[#3D3D40] flex-1 min-w-0">{a.html}</div>
                  <div className="text-[11px] text-[#B8B8BB] shrink-0">{a.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,.08)] overflow-hidden">
          <div className="px-[18px] py-3 border-b border-[#E5E7EB]">
            <h3 className="text-[13px] font-semibold text-[#3D3D40]">Próximas Llamadas</h3>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 mb-1">En desarrollo</p>
            <p className="text-[13px] text-[#3D3D40] font-medium mb-1">Próximamente</p>
            <p className="text-[12px] text-[#6D6D70] leading-relaxed">
              El calendario de llamadas con IA estará disponible cuando activemos el módulo Llamadas IA.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
          <div className="text-[11px] text-[#6D6D70] font-medium mb-1">Conversaciones</div>
          <div className="text-[22px] font-extrabold text-[#1a1a1c] tabular-nums">{metrics.totalChats}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
          <div className="text-[11px] text-[#6D6D70] font-medium mb-1">Sin Leer</div>
          <div className="text-[22px] font-extrabold tabular-nums text-amber-500">{metrics.unread}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
          <div className="text-[11px] text-[#6D6D70] font-medium mb-1">Abiertas</div>
          <div className="text-[22px] font-extrabold tabular-nums text-brand-500">{metrics.abiertas}</div>
        </div>
      </div>
    </div>
  );
}
