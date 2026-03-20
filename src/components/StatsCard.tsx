import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
  /** Clases Tailwind para el color del icono (ej. text-emerald-400) */
  accentClassName?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  accentClassName = 'text-brand-400',
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-app-line bg-gradient-to-br from-white/[0.06] to-transparent px-4 py-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] font-professional transition-[border-color,box-shadow] duration-200 hover:border-app-line-strong">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl bg-white/[0.06] border border-app-line shrink-0 ${accentClassName}`}
        >
          <Icon className="size-[22px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>
          <p className="text-2xl sm:text-[26px] font-bold text-white mt-1 leading-none tracking-tight tabular-nums font-display">
            {value}
          </p>
          {change ? (
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                {change}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
