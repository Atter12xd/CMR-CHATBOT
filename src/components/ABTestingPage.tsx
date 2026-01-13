import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';

export default function ABTestingPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  const tests = [
    {
      id: '1',
      name: 'Message Tone Test',
      description: 'Testing friendly vs professional message tone',
      variantA: 'Friendly tone (with emojis)',
      variantB: 'Professional tone (formal)',
      status: 'active',
      startDate: '2024-01-15',
      participants: 1247,
      conversionA: 34.2,
      conversionB: 28.7,
      winner: 'A',
    },
    {
      id: '2',
      name: 'CTA Button Test',
      description: 'Testing "Buy Now" vs "Add to Cart" button text',
      variantA: 'Buy Now',
      variantB: 'Add to Cart',
      status: 'completed',
      startDate: '2024-01-10',
      participants: 2156,
      conversionA: 22.1,
      conversionB: 31.5,
      winner: 'B',
    },
    {
      id: '3',
      name: 'Discount Offer Test',
      description: 'Testing 10% vs $5 off discount offers',
      variantA: '10% OFF',
      variantB: '$5 OFF',
      status: 'active',
      startDate: '2024-01-20',
      participants: 892,
      conversionA: 18.9,
      conversionB: 21.3,
      winner: null,
    },
  ];

  const filteredTests = activeFilter === 'all' 
    ? tests 
    : tests.filter(test => test.status === activeFilter);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">A/B Testing</h1>
          <p className="text-[#64748B]">Optimize your conversion rates with data-driven tests</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 font-medium">
          <Plus size={18} />
          New Test
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {(['all', 'active', 'paused', 'completed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary text-white'
                : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Tests Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">
            {filteredTests.length} test(s)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">TEST NAME</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">VARIANT A</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">VARIANT B</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">PARTICIPANTS</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CONVERSION A</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CONVERSION B</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">WINNER</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">STATUS</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0F172A]">{test.name}</div>
                    <div className="text-xs text-[#64748B]">{test.description}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#0F172A]">{test.variantA}</td>
                  <td className="px-4 py-3 text-sm text-[#0F172A]">{test.variantB}</td>
                  <td className="px-4 py-3 text-sm text-[#0F172A]">{test.participants.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{test.conversionA}%</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{test.conversionB}%</td>
                  <td className="px-4 py-3">
                    {test.winner ? (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        test.winner === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        Variant {test.winner}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748B]">In progress</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      test.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : test.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded">
                      <Settings size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

