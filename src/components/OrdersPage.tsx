import { useState } from 'react';
import OrderCard from './OrderCard';
import type { Order } from '../data/mockData';
import { mockOrders } from '../data/mockData';

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredOrders = filter === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === filter);

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">Gestiona todos los pedidos de tus clientes</p>
      </div>

      {/* Filtros - Scroll horizontal en móvil */}
      <div className="mb-4 lg:mb-6">
        <div className="flex overflow-x-auto pb-2 lg:pb-0 lg:flex-wrap gap-2 lg:gap-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl lg:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
              filter === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl lg:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
              filter === 'pending'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-xl lg:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
              filter === 'processing'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Procesando
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded-xl lg:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
              filter === 'shipped'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Enviados
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-xl lg:rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
              filter === 'delivered'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

