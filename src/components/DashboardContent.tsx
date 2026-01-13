import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import { MessageSquare, Users, ShoppingCart, TrendingUp, DollarSign, Calendar, Clock, User } from 'lucide-react';
import { mockChats } from '../data/mockData';
import { mockOrders } from '../data/mockData';
import { getDailySales, getWeeklySales, getMonthlySales, formatCurrency, getAllPayments, getPaymentMethodText } from '../data/payments';
import { formatTime } from '../data/mockData';

export default function DashboardContent() {
  const [allPayments, setAllPayments] = useState(getAllPayments());

  // Actualizar pagos cada 2 segundos para reflejar cambios en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setAllPayments(getAllPayments());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const dailySales = getDailySales();
  const weeklySales = getWeeklySales();
  const monthlySales = getMonthlySales();
  const totalPayments = allPayments.length;

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1 sm:mt-2">Resumen de tu centro de atención al cliente</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <StatsCard
          title="Conversaciones Activas"
          value={mockChats.filter(c => c.status === 'active').length}
          change="+12% vs mes anterior"
          icon={MessageSquare}
          color="primary"
        />
        <StatsCard
          title="Clientes Totales"
          value={mockChats.length}
          change="+5 nuevos hoy"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Pedidos Pendientes"
          value={mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          change="3 en proceso"
          icon={ShoppingCart}
          color="yellow"
        />
        <StatsCard
          title="Tasa de Resolución"
          value="87%"
          change="+3% vs mes anterior"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Ventas por período */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 sm:mb-4">📊 Ventas Registradas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard
            title="Ventas de Hoy"
            value={formatCurrency(dailySales)}
            change={`${allPayments.filter(p => {
              const paymentDate = new Date(p.timestamp);
              const today = new Date();
              return paymentDate.toDateString() === today.toDateString();
            }).length} pago(s) registrado(s)`}
            icon={Clock}
            color="primary"
          />
          <StatsCard
            title="Ventas de Esta Semana"
            value={formatCurrency(weeklySales)}
            change={`${allPayments.filter(p => {
              const paymentDate = new Date(p.timestamp);
              const startOfWeek = new Date();
              startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
              return paymentDate >= startOfWeek;
            }).length} pago(s) esta semana`}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Ventas del Mes"
            value={formatCurrency(monthlySales)}
            change={`${allPayments.filter(p => {
              const paymentDate = new Date(p.timestamp);
              const now = new Date();
              return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
            }).length} pago(s) este mes`}
            icon={DollarSign}
            color="yellow"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-3 sm:mb-4">Conversaciones por Estado</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Activas</span>
              <span className="font-semibold text-gray-900">
                {mockChats.filter(c => c.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Esperando</span>
              <span className="font-semibold text-gray-900">
                {mockChats.filter(c => c.status === 'waiting').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Resueltas</span>
              <span className="font-semibold text-gray-900">
                {mockChats.filter(c => c.status === 'resolved').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-3 sm:mb-4">Pedidos por Estado</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pendientes</span>
              <span className="font-semibold text-gray-900">
                {mockOrders.filter(o => o.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Procesando</span>
              <span className="font-semibold text-gray-900">
                {mockOrders.filter(o => o.status === 'processing').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Enviados</span>
              <span className="font-semibold text-gray-900">
                {mockOrders.filter(o => o.status === 'shipped').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Entregados</span>
              <span className="font-semibold text-gray-900">
                {mockOrders.filter(o => o.status === 'delivered').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagos por Cliente */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-3 sm:mb-4">💳 Pagos Registrados por Cliente</h2>
        {allPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-2 opacity-50" />
            <p>No hay pagos registrados aún.</p>
            <p className="text-sm mt-1">Los comprobantes de pago enviados en los chats aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              // Agrupar pagos por cliente
              const paymentsByCustomer = allPayments.reduce((acc, payment) => {
                const key = payment.customerName.toLowerCase();
                if (!acc[key]) {
                  acc[key] = {
                    customerName: payment.customerName,
                    customerEmail: payment.customerEmail,
                    payments: [],
                    total: 0,
                  };
                }
                acc[key].payments.push(payment);
                acc[key].total += payment.amount;
                return acc;
              }, {} as Record<string, { customerName: string; customerEmail?: string; payments: typeof allPayments; total: number }>);

              return Object.values(paymentsByCustomer)
                .sort((a, b) => b.total - a.total)
                .map((customerData) => (
                  <div key={customerData.customerName} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{customerData.customerName}</h3>
                        {customerData.customerEmail && (
                          <p className="text-sm text-gray-500">{customerData.customerEmail}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">{formatCurrency(customerData.total)}</p>
                        <p className="text-xs text-gray-500">{customerData.payments.length} pago(s)</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {customerData.payments
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((payment) => (
                          <div key={payment.id} className="bg-gray-50 rounded p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              {payment.receiptImage && (
                                <img 
                                  src={payment.receiptImage} 
                                  alt="Comprobante" 
                                  className="w-16 h-16 object-cover rounded border border-gray-200"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    payment.method === 'yape' ? 'bg-green-100 text-green-700' :
                                    payment.method === 'plin' ? 'bg-blue-100 text-blue-700' :
                                    payment.method === 'bcp' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {getPaymentMethodText(payment.method)}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                                    payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {payment.status === 'verified' ? 'Verificado' :
                                     payment.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{formatTime(payment.timestamp)}</p>
                                {payment.notes && (
                                  <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

