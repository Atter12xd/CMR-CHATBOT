interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const sizes = {
  sm: { img: 'h-8', text: 'text-lg' },
  md: { img: 'h-10 sm:h-12', text: 'text-xl sm:text-2xl' },
  lg: { img: 'h-12 sm:h-16 md:h-20', text: 'text-2xl sm:text-3xl' },
};

export default function LogoBrand({ size = 'md', href = '/' }: LogoBrandProps) {
  const s = sizes[size];
  const content = (
    <>
      <img src="/logo.png" alt="wazapp.ai" className={`${s.img} w-auto shrink-0`} />
      <span className={`${s.text} font-bold tracking-tight shrink-0`}>
        <span className="text-teal-400">wazapp</span>
        <span className="text-emerald-400">.ai</span>
      </span>
    </>
  );

  const className = 'flex items-center gap-2';

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}
