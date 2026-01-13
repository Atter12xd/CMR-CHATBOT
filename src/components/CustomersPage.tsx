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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Customers</h1>
        <p className="text-[#64748B]">Manage your customer base</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">
            {filteredCustomers.length} customer(s)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CUSTOMER</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">EMAIL</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">TOTAL ORDERS</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">TOTAL SPENT</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">LAST ORDER</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="font-semibold text-[#0F172A]">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-[#0F172A]">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">
                      {customer.lastOrderDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
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

