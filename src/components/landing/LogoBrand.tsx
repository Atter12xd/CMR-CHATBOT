interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const sizes = {
  sm: { img: 'h-10', text: 'text-xl' },
  md: { img: 'h-12 sm:h-14', text: 'text-xl sm:text-2xl' },
  lg: { img: 'h-14 sm:h-20 md:h-24', text: 'text-[1.65rem] sm:text-3xl md:text-4xl' },
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
