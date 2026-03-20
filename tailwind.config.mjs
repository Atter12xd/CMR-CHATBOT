/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        /** Navegación / UI tipo producto profesional (legible, denso) */
        professional: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: {
          shell: '#06080e',
          canvas: '#090c14',
          raised: '#0c1018',
          card: '#101622',
          'card-hover': '#141c28',
          line: 'rgba(255, 255, 255, 0.07)',
          'line-strong': 'rgba(255, 255, 255, 0.11)',
        },
        brand: {
          50: '#eef7ff',
          100: '#d8ecff',
          200: '#b9deff',
          300: '#89cbff',
          400: '#52aeff',
          500: '#2a8bff',
          600: '#1a6ef5',
          700: '#1458e1',
          800: '#1747b6',
          900: '#193e8f',
          950: '#142757',
        },
        accent: {
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
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
        'glow': '0 0 40px -10px rgba(42, 139, 255, 0.3)',
        'glow-lg': '0 0 60px -15px rgba(42, 139, 255, 0.4)',
        'app-card':
          '0 1px 0 0 rgba(255, 255, 255, 0.04) inset, 0 16px 48px -20px rgba(0, 0, 0, 0.55)',
        'app-header': '0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'app-canvas':
          'radial-gradient(ellipse 90% 60% at 50% -15%, rgba(42, 139, 255, 0.09), transparent 52%), radial-gradient(ellipse 70% 45% at 100% 0%, rgba(16, 185, 129, 0.05), transparent 45%), linear-gradient(180deg, #090c14 0%, #080a10 100%)',
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
