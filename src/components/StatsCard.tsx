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
  const colorConfig: Record<string, { bg: string; icon: string; border: string; glow: string }> = {
    primary: {
      bg: 'bg-blue-500/8',
      icon: 'text-blue-400',
      border: 'border-blue-500/10',
      glow: 'shadow-blue-500/5',
    },
    green: {
      bg: 'bg-emerald-500/8',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/10',
      glow: 'shadow-emerald-500/5',
    },
    yellow: {
      bg: 'bg-amber-500/8',
      icon: 'text-amber-400',
      border: 'border-amber-500/10',
      glow: 'shadow-amber-500/5',
    },
    red: {
      bg: 'bg-rose-500/8',
      icon: 'text-rose-400',
      border: 'border-rose-500/10',
      glow: 'shadow-rose-500/5',
    },
  };

  const colors = colorConfig[color] || colorConfig.primary;

  return (
    <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 group-hover:text-slate-400 transition-colors">
            {title}
          </p>
          <p className="text-[26px] font-extrabold text-white mt-2 leading-none tracking-tight">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`${colors.bg} ${colors.border} border p-2.5 rounded-xl flex-shrink-0 ml-3`}>
          <Icon size={20} className={colors.icon} />
        </div>
      </div>
    </div>
  );
}