import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Opcional — el mock wazapp no usa subtítulo superior en varias vistas */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-[#6D6D70] mb-1">{eyebrow}</p>
        )}
        <h2 className="text-[22px] font-bold text-[#1a1a1c] leading-tight font-professional">{title}</h2>
        {description && (
          <p className="text-[13px] text-[#6D6D70] mt-0.5 max-w-2xl leading-snug">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
