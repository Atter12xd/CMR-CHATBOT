import { useState } from 'react';
import { mockOrders } from '../data/mockData';
import type { Order } from '../data/mockData';

interface PipelineColumn {
  title: string;
  status: string;
  color: string;
}

export default function PipelinePage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  
  const columns: PipelineColumn[] = [
    { title: 'New', status: 'pending', color: '#3B82F6' },
    { title: 'Pending Confirm', status: 'processing', color: '#F59E0B' },
    { title: 'Confirmed', status: 'shipped', color: '#10B981' },
    { title: 'Shipped', status: 'shipped', color: '#6366F1' },
    { title: 'Delivered', status: 'delivered', color: '#059669' },
    { title: 'RTO', status: 'cancelled', color: '#DC2626' },
  ];

  const getOrdersByStatus = (status: string) => {
    if (status === 'pending') return mockOrders.filter(o => o.status === 'pending');
    if (status === 'processing') return mockOrders.filter(o => o.status === 'processing');
    if (status === 'shipped') return mockOrders.filter(o => o.status === 'shipped');
    if (status === 'delivered') return mockOrders.filter(o => o.status === 'delivered');
    if (status === 'cancelled') return mockOrders.filter(o => o.status === 'cancelled');
    return [];
  };

  const totalValue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">
          <span className="hidden sm:inline">Pipeline Overview - </span>
          {mockOrders.length} orders <span className="hidden md:inline">(${totalValue.toFixed(2)} total value)</span>
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm ${
              period === 'today' ? 'bg-primary text-white border-primary' : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm ${
              period === 'week' ? 'bg-primary text-white border-primary' : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm ${
              period === 'month' ? 'bg-primary text-white border-primary' : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Pipeline Columns */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5" style={{ minHeight: 'calc(100vh - 300px)' }}>
        {columns.map((column) => {
          const orders = getOrdersByStatus(column.status);
          const riskScore = Math.floor(Math.random() * 100);
          
          return (
            <div key={column.title} className="min-w-[260px] sm:min-w-[280px] bg-white border border-[#E2E8F0] rounded-lg flex-shrink-0 flex flex-col">
              {/* Column Header */}
              <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[#0F172A]">
                  {column.title}
                </div>
                <div className="bg-[#F8FAFC] text-[#64748B] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  {orders.length}
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 overflow-y-auto space-y-2">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-[#64748B] text-sm">No orders</div>
                ) : (
                  orders.map((order) => {
                    const risk = riskScore;
                    const riskClass = risk > 60 ? 'risk-high' : risk > 30 ? 'risk-medium' : 'risk-low';
                    
                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-[#E2E8F0] rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderLeft: `3px solid ${column.color}` }}
                      >
                        <div className="text-[11px] text-[#64748B] font-semibold mb-1.5">
                          {order.id}
                        </div>
                        <div className="text-[13px] font-semibold text-[#0F172A] mb-1">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-[#64748B] mb-2">
                          {order.items[0]?.name || 'Product'}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-[#0F172A]">
                            ${order.total.toFixed(2)}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            riskClass === 'risk-high' 
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : riskClass === 'risk-medium'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {risk}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

