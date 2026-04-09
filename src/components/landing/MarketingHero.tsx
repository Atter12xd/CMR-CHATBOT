import type { ReactNode } from 'react';

const maxMap = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  wide: 'max-w-6xl',
};

export default function MarketingHero({
  children,
  maxWidth = 'lg',
  align = 'center',
  className = '',
}: {
  children: ReactNode;
  maxWidth?: keyof typeof maxMap;
  align?: 'center' | 'left';
  className?: string;
}) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <section
      className={`relative pt-20 lg:pt-24 pb-14 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-app-canvas ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.55] dark:opacity-[0.14] [mask-image:linear-gradient(to_bottom,black_25%,transparent_88%)] dark:[mask-image:linear-gradient(to_bottom,black_18%,transparent_92%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-hero-glow opacity-100 dark:opacity-[0.42]"
        aria-hidden
      />
      <div className="landing-noise dark:opacity-[0.018]" aria-hidden />
      <div className={`relative ${maxMap[maxWidth]} ${alignCls}`}>{children}</div>
    </section>
  );
}
