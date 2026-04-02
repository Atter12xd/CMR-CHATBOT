/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        /** Navegación / UI tipo producto profesional (legible, denso) */
        professional: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
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
        /** Acento grafito / acero (sin azul saturado), armonizado con charcoal #2b2c2f */
        brand: {
          50: '#f4f4f5',
          100: '#e9eaec',
          200: '#d5d6da',
          300: '#b6b8bf',
          400: '#91939d',
          500: '#6e717c',
          600: '#545661',
          700: '#45474f',
          800: '#3a3c43',
          900: '#32333a',
          950: '#2b2c2f',
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
        glow: '0 0 40px -10px rgba(43, 44, 47, 0.12)',
        'glow-lg': '0 0 60px -15px rgba(43, 44, 47, 0.16)',
        'app-card': '0 4px 24px -6px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'app-header': '0 1px 0 0 rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'app-canvas':
          'radial-gradient(ellipse 90% 60% at 50% -15%, rgba(43, 44, 47, 0.04), transparent 52%), radial-gradient(ellipse 70% 45% at 100% 0%, rgba(43, 44, 47, 0.03), transparent 45%), linear-gradient(180deg, #F8F9FB 0%, #F3F5F8 100%)',
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
