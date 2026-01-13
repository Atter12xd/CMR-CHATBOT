import { useState } from 'react';
import { mockOrders, formatTime } from '../data/mockData';
import type { Order } from '../data/mockData';
import { Filter, Download } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'all';

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');
  const [orders] = useState<Order[]>(mockOrders);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Pedidos</h1>
        <p className="text-[#64748B]">Gestiona todos tus pedidos</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            filterStatus === 'all'
              ? 'bg-primary text-white'
              : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          Todos
        </button>
        {Object.keys(statusLabels).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as OrderStatus)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
            {filteredOrders.length} pedido(s)
          </h2>
          <div className="flex gap-2">
            <button className="px-2 sm:px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-1.5 sm:gap-2">
              <Filter size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">Filtrar</span>
            </button>
            <button className="px-2 sm:px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-1.5 sm:gap-2">
              <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Items
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                    No hay pedidos con este filtro
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">
                      {order.id}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="text-xs sm:text-sm font-medium text-[#0F172A]">
                        {order.customerName}
                      </div>
                      <div className="text-[10px] sm:text-xs text-[#64748B] truncate max-w-[120px] sm:max-w-none">{order.customerEmail}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">
                      {formatTime(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
