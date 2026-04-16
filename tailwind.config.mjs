/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        /** Alias: todo Inter (diseñonuevo) */
        display: ['Inter', 'system-ui', 'sans-serif'],
        professional: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        app: {
          /** wazapp-standalone — canvas #F9FAFB */
          shell: '#F9FAFB',
          canvas: '#F9FAFB',
          raised: '#FFFFFF',
          card: '#FFFFFF',
          'card-hover': '#F3F4F6',
          line: 'rgba(15, 23, 42, 0.08)',
          'line-strong': 'rgba(15, 23, 42, 0.14)',
          ink: '#3D3D40',
          muted: '#6D6D70',
          charcoal: '#1a1a1c',
          field: '#ECEEF2',
        },
        /**
         * Primario azul (hsl 218 100% 55%) — mismo acento que diseñonuevo / shadcn ref.
         */
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1b70ff',
          600: '#155fcc',
          700: '#0f4a99',
          800: '#0c3d7a',
          900: '#0a3266',
          950: '#051c3d',
        },
        accent: {
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        },
        /** Tokens CSS (:root / .dark en reference-theme.css) — panel + modo oscuro */
        ref: {
          bg: 'hsl(var(--background) / <alpha-value>)',
          fg: 'hsl(var(--foreground) / <alpha-value>)',
          card: 'hsl(var(--card) / <alpha-value>)',
          border: 'hsl(var(--border) / <alpha-value>)',
          muted: 'hsl(var(--muted) / <alpha-value>)',
          'muted-fg': 'hsl(var(--muted-foreground) / <alpha-value>)',
          input: 'hsl(var(--input) / <alpha-value>)',
          popover: 'hsl(var(--popover) / <alpha-value>)',
          sidebar: 'hsl(var(--sidebar) / <alpha-value>)',
          'sidebar-fg': 'hsl(var(--sidebar-foreground) / <alpha-value>)',
          'sidebar-border': 'hsl(var(--sidebar-border) / <alpha-value>)',
          'sidebar-accent': 'hsl(var(--sidebar-accent) / <alpha-value>)',
          thread: 'hsl(var(--thread-bg) / <alpha-value>)',
          list: 'hsl(var(--list-bg) / <alpha-value>)',
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
      ringOffsetColor: {
        /** Anillo focus (botones) coherente con fondo en claro/oscuro */
        'ref-bg': 'hsl(var(--background) / 1)',
      },
      borderRadius: {
        /** Coincide con --radius-ref del tema diseñonuevo (9px) */
        ref: '0.5625rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 0 44px -10px rgba(27, 112, 255, 0.2)',
        'glow-lg': '0 0 64px -14px rgba(27, 112, 255, 0.22)',
        'app-card': '0 4px 24px -6px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        /** Tarjetas “editoriales”: más profundidad + bisel suave */
        'app-card-premium':
          '0 0 0 1px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.03), 0 20px 50px -18px rgba(15, 23, 42, 0.12)',
        'app-card-premium-hover':
          '0 0 0 1px rgba(27, 112, 255, 0.22), 0 4px 12px rgba(15, 23, 42, 0.06), 0 28px 56px -20px rgba(15, 23, 42, 0.14)',
        'app-header': '0 1px 0 0 rgba(15, 23, 42, 0.06)',
        'nav-float': '0 12px 48px -16px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(15, 23, 42, 0.05)',
      },
      backgroundImage: {
        /** Plano como wazapp (sin gradiente en panel) */
        'app-canvas': 'linear-gradient(180deg, #f9fafb 0%, #f9fafb 100%)',
        /** Rejilla fina tipo sitios premium */
        'site-grid':
          'linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
        /** Velado + highlight esquina */
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 70% -10%, rgba(27, 112, 255, 0.1), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(43, 44, 47, 0.05), transparent 55%)',
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
