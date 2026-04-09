import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
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
        <p className="text-xs font-medium uppercase tracking-wider text-app-muted mb-1">
          {eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-app-ink tracking-tight leading-tight font-professional">
          {title}
        </h2>
        {description && (
          <p className="text-app-muted text-sm mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
