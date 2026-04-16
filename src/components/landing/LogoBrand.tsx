interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showText?: boolean;
}

const sizes = {
  sm: { 
    img: 'h-10 w-10', 
    text: 'text-lg',
    gap: 'gap-2'
  },
  md: { 
    img: 'h-12 w-12 sm:h-14 sm:w-14', 
    text: 'text-xl sm:text-2xl',
    gap: 'gap-3'
  },
  lg: {
    img: 'h-9 w-9 sm:h-10 sm:w-10',
    text: 'text-[1.15rem] sm:text-xl',
    gap: 'gap-2.5'
  },
};

export default function LogoBrand({ size = 'md', href = '/', showText = true }: LogoBrandProps) {
  const s = sizes[size];
  
  const content = (
    <>
      {/* Logo Icon */}
      <div className={`${s.img} relative flex items-center justify-center`}>
        <img 
          src="/logo.png" 
          alt="wazapp.ai" 
          className="h-full w-full object-contain"
        />
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={`${s.text} font-bold tracking-tight leading-none font-professional`}>
          <span className="text-app-ink">wazapp</span>
          <span className="text-brand-600">.ai</span>
        </span>
      )}
    </>
  );

  const className = `flex items-center ${s.gap} group`;

  if (href) {
    return (
      <a href={href} className={`${className} transition-opacity hover:opacity-90`}>
        {content}
      </a>
    );
  }
  
  return <div className={className}>{content}</div>;
}