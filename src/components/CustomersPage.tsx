import { useState } from 'react';
import { mockChats, mockOrders } from '../data/mockData';
import { Users, Search } from 'lucide-react';

interface CustomerData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  status: 'active' | 'inactive';
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Agrupar datos de chats y pedidos por cliente
  const customers: CustomerData[] = mockChats.map((chat) => {
    const customerOrders = mockOrders.filter(order => order.customerEmail === chat.customerEmail);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder = customerOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      id: chat.id,
      name: chat.customerName,
      email: chat.customerEmail,
      avatar: chat.customerAvatar,
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt || new Date(),
      status: chat.status === 'active' ? 'active' : 'inactive',
    };
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Customers</h1>
        <p className="text-sm sm:text-base text-[#64748B]">Manage your customer base</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] sm:w-[18px] sm:h-[18px]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">
            {filteredCustomers.length} customer(s)
          </h2>
        </div>

        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CUSTOMER</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">EMAIL</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">TOTAL ORDERS</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">TOTAL SPENT</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">LAST ORDER</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-[#64748B]">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                        />
                        <div className="font-semibold text-xs sm:text-sm text-[#0F172A] truncate">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B] truncate max-w-[120px] sm:max-w-none">{customer.email}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">{customer.totalOrders}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">
                      {customer.lastOrderDate.toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
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

