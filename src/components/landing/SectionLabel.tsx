import type { ReactNode } from 'react';

export default function SectionLabel({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const lineL = dark
    ? 'h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-white/30 to-white/10'
    : 'h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-app-line-strong to-app-line-strong/80';
  const lineR = dark
    ? 'h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-white/30 to-white/10'
    : 'h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-app-line-strong to-app-line-strong/80';
  const text = dark
    ? 'text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50'
    : 'text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-app-muted';
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <span className={lineL} aria-hidden />
      <p className={text}>{children}</p>
      <span className={lineR} aria-hidden />
    </div>
  );
}
