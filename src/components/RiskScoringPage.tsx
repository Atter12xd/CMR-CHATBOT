import { Edit } from 'lucide-react';

export default function RiskScoringPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Risk Scoring</h1>
        <p className="text-sm sm:text-base text-[#64748B]">AI-powered risk assessment and model performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Scoring Model Performance */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-[#0F172A] mb-4">Scoring Model Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">Prediction Accuracy</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-success">89.4%</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">False Positives</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-warning">8.3%</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">False Negatives</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-danger">2.3%</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">Orders Analyzed</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-[#0F172A]">8,432</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] font-medium">Model Version</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-[#0F172A]">v2.4.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5">
          <h2 className="text-sm sm:text-[15px] font-semibold text-[#0F172A] mb-3 sm:mb-4">Risk Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">Low Risk (0-30)</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-success">82.4%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '82.4%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm text-[#64748B] font-medium">Medium Risk (31-60)</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-warning">13.8%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: '13.8%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] font-medium">High Risk (61-100)</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-danger">3.8%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: '3.8%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Factors Configuration */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm sm:text-[15px] font-semibold text-[#0F172A]">Scoring Factors Configuration</h2>
          <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 self-start sm:self-auto">
            <Edit size={12} className="sm:w-[14px] sm:h-[14px]" />
            Edit Weights
          </button>
        </div>

        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">FACTOR</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">WEIGHT</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">LOW RISK</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">MEDIUM RISK</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">HIGH RISK</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Delivery Zone</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">30%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Premium zones (-20pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Standard zones (0pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">High RTO zones (+25pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[9px] sm:text-[10px] font-semibold">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-700 rounded-full"></span>
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Customer History</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">35%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Repeat customer (-30pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">New customer (+10pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Previous RTO (+35pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[9px] sm:text-[10px] font-semibold">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-700 rounded-full"></span>
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Order Value</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">15%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">High ticket &gt;$80 (-15pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Medium $40-80 (0pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Low ticket &lt;$40 (+20pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[9px] sm:text-[10px] font-semibold">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-700 rounded-full"></span>
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F8FAFC]">
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">Behavior AI Analysis</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#0F172A]">20%</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Positive signals (-25pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Neutral (0pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#64748B]">Negative signals (+30pts)</td>
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[9px] sm:text-[10px] font-semibold">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-700 rounded-full"></span>
                    ACTIVE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

