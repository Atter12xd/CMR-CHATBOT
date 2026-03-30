import type { LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ComponentType<LucideProps>;
  accentClassName?: string;
  /** Fondo del icono (ej. "bg-blue-50", "bg-amber-50") */
  iconBg?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  accentClassName = 'text-brand-500',
  iconBg = 'bg-app-field',
}: StatsCardProps) {
  return (
    <div className="rounded-[22px] border border-app-line bg-white px-5 py-5 shadow-app-card font-professional transition-[border-color,box-shadow] duration-200 hover:border-app-line-strong">
      <div className={`inline-flex p-3 rounded-2xl ${iconBg} mb-3`}>
        <Icon className={`size-[22px] ${accentClassName}`} strokeWidth={2} />
      </div>
      <p className="text-[28px] sm:text-[32px] font-bold text-app-ink leading-none tracking-tight tabular-nums font-display">
        {value}
      </p>
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-app-muted mt-2">
        {title}
      </p>
      {change && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600">
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
