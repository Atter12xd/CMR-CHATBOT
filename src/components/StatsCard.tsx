import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';


interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
  color?: string;
}


export default function StatsCard({ title, value, change, icon: Icon, color = 'primary' }: StatsCardProps) {
  const colorConfig: Record<string, { bg: string; icon: string; ring: string }> = {
    primary: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      ring: 'ring-violet-100',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      ring: 'ring-emerald-100',
    },
    yellow: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      ring: 'ring-amber-100',
    },
    red: {
      bg: 'bg-rose-50',
      icon: 'text-rose-600',
      ring: 'ring-rose-100',
    },
  };

  const colors = colorConfig[color] || colorConfig.primary;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-[28px] font-bold text-slate-900 mt-1.5 leading-tight">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`${colors.bg} ${colors.ring} ring-1 p-2.5 rounded-xl flex-shrink-0 ml-3`}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </div>
  );
}