import { Download } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Analytics</h1>
        <p className="text-sm sm:text-base text-[#64748B]">ROAS: Reported vs Actual Performance</p>
      </div>

      {/* ROAS Chart Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg mb-4">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">ROAS: Reported vs Actual (Last 30 Days)</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] hover:bg-[#F8FAFC]">
              TikTok
            </button>
            <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] hover:bg-[#F8FAFC]">
              Meta
            </button>
            <button className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium">
              All Channels
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-3 sm:p-4 bg-[#F8FAFC] rounded-lg">
              <div className="text-[10px] sm:text-[11px] text-[#64748B] mb-1">Platform Reported</div>
              <div className="text-xl sm:text-2xl font-bold text-success">4.2x</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#F8FAFC] rounded-lg">
              <div className="text-[10px] sm:text-[11px] text-[#64748B] mb-1">Actual Delivered</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">3.1x</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#F8FAFC] rounded-lg">
              <div className="text-[10px] sm:text-[11px] text-[#64748B] mb-1">Difference</div>
              <div className="text-xl sm:text-2xl font-bold text-danger">-26%</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#F8FAFC] rounded-lg">
              <div className="text-[10px] sm:text-[11px] text-[#64748B] mb-1">Lost Revenue</div>
              <div className="text-xl sm:text-2xl font-bold text-danger">$8.4K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">Campaign Performance Breakdown</h2>
          <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 self-start sm:self-auto">
            <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CAMPAIGN</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">CHANNEL</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">SPEND</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">ORDERS</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">DELIVERED</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">RTO%</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">REPORTED ROAS</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">ACTUAL ROAS</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Q1-Protein-Premium</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">TikTok</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">$2,847</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">342</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">241</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-danger">29.5%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-success">4.8x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-primary">3.4x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-danger">-29%</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Jan-Supplements-LAL</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">Meta</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">$1,923</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">287</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">223</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-warning">22.3%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-success">4.2x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-primary">3.3x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-danger">-21%</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">IG-Story-Collagen</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">Instagram</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">$1,247</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">198</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#0F172A]">171</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-success">13.6%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-success">5.1x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-primary">4.4x</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-warning">-14%</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">Google-Search-Brand</td>
                <td className="px-4 py-3 text-sm text-[#0F172A]">Google</td>
                <td className="px-4 py-3 text-sm text-[#0F172A]">$847</td>
                <td className="px-4 py-3 text-sm text-[#0F172A]">124</td>
                <td className="px-4 py-3 text-sm text-[#0F172A]">112</td>
                <td className="px-4 py-3 text-sm font-semibold text-success">9.7%</td>
                <td className="px-4 py-3 text-sm font-semibold text-success">6.2x</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">5.6x</td>
                <td className="px-4 py-3 text-sm font-semibold text-warning">-10%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

