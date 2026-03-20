import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
}

export default function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  return (
    <div className="app-card-interactive p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {title}
          </p>
          <p className="text-[26px] font-bold text-white mt-2 leading-none tracking-tight tabular-nums font-display">
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
        <div className="flex-shrink-0 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/15">
          <Icon size={20} className="text-brand-400" />
        </div>
      </div>
    </div>
  );
}
