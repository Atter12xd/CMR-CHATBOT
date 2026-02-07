interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

// Logo y texto alineados al mismo tamaño visual
const sizes = {
  sm: { img: 'h-12', text: 'text-xl' },
  md: { img: 'h-14 sm:h-16', text: 'text-2xl sm:text-3xl' },
  lg: {
    img: 'h-20 sm:h-24 md:h-28',
    text: 'text-2xl sm:text-3xl md:text-[2.45rem]',
  },
};

export default function LogoBrand({ size = 'md', href = '/' }: LogoBrandProps) {
  const s = sizes[size];
  const content = (
    <>
      <img src="/logo.png" alt="wazapp.ai" className={`${s.img} w-auto shrink-0 object-contain`} />
      <span className={`${s.text} font-bold tracking-tight shrink-0 leading-none flex items-center`}>
        <span className="text-teal-400">wazapp</span>
        <span className="text-emerald-400">.ai</span>
      </span>
    </>
  );

  const className = 'flex items-center gap-2.5';

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}
