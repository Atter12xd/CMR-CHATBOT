/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Outfit',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        /** Titulares — geométrico, menos “plantilla genérica” */
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        /** Cuerpo UI — legible y denso */
        professional: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: {
          shell: '#F8F9FB',
          canvas: '#F8F9FB',
          raised: '#FFFFFF',
          card: '#FFFFFF',
          'card-hover': '#F3F4F6',
          line: 'rgba(15, 23, 42, 0.08)',
          'line-strong': 'rgba(15, 23, 42, 0.14)',
          ink: '#000000',
          muted: '#9EA3AE',
          /** Antracita principal — rgb(43 44 47) */
          charcoal: '#2b2c2f',
          /** Búsquedas / campos suaves */
          field: '#ECEEF2',
        },
        /**
         * Acento petróleo (teal profundo): contraste con charcoal, lectura en UI clara,
         * cercano al tono “confianza / acción” sin azul genérico.
         */
        brand: {
          50: '#f0f9f8',
          100: '#d9f0ec',
          200: '#b3e0d9',
          300: '#7cc9bf',
          400: '#4aaa9c',
          500: '#358a7d',
          600: '#2a7166',
          700: '#245c54',
          800: '#214a45',
          900: '#1e3f3b',
          950: '#0d2421',
        },
        accent: {
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        },
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 0 44px -10px rgba(42, 130, 118, 0.2)',
        'glow-lg': '0 0 64px -14px rgba(42, 130, 118, 0.22)',
        'app-card': '0 4px 24px -6px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        /** Tarjetas “editoriales”: más profundidad + bisel suave */
        'app-card-premium':
          '0 0 0 1px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.03), 0 20px 50px -18px rgba(15, 23, 42, 0.12)',
        'app-card-premium-hover':
          '0 0 0 1px rgba(42, 130, 118, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06), 0 28px 56px -20px rgba(15, 23, 42, 0.14)',
        'app-header': '0 1px 0 0 rgba(15, 23, 42, 0.06)',
        'nav-float': '0 12px 48px -16px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(15, 23, 42, 0.05)',
      },
      backgroundImage: {
        'app-canvas':
          'radial-gradient(ellipse 90% 60% at 50% -12%, rgba(42, 130, 118, 0.07), transparent 55%), radial-gradient(ellipse 65% 40% at 100% 0%, rgba(43, 44, 47, 0.035), transparent 48%), linear-gradient(180deg, #F8F9FB 0%, #F3F5F8 100%)',
        /** Rejilla fina tipo sitios premium */
        'site-grid':
          'linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
        /** Velado + highlight esquina */
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 70% -10%, rgba(42, 130, 118, 0.11), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(43, 44, 47, 0.06), transparent 55%)',
      },
      backgroundSize: {
        grid: '56px 56px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
