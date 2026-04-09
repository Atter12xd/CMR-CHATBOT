import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
  /** Clases Tailwind para el color del icono (ej. text-emerald-500) */
  accentClassName?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  accentClassName = 'text-brand-500',
}: StatsCardProps) {
  return (
    <div className="rounded-ref border border-app-line bg-ref-card px-4 py-4 shadow-sm font-professional transition-[border-color,box-shadow] duration-200 hover:border-brand-500/25 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-2xl bg-app-field shrink-0 ${accentClassName}`}
        >
          <Icon className="size-[22px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted">
            {title}
          </p>
          <p className="text-2xl sm:text-[26px] font-bold text-app-ink mt-1 leading-none tracking-tight tabular-nums font-professional">
            {value}
          </p>
          {change ? (
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600">
                {change}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
