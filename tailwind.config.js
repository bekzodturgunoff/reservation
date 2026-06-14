/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#059669',
          dark: '#047857',
          darker: '#065F46',
          light: '#D1FAE5',
          pale: '#ECFDF5',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          secondary: '#374151',
          tertiary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F9FAFB',
          subtle: '#F3F4F6',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: '#EFF6FF',
        },
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
        button: '0 1px 2px rgba(5,150,105,0.3), 0 4px 12px rgba(5,150,105,0.2)',
        nav: '0 1px 0 rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-out': 'cubic-bezier(0.76, 0, 0.24, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        xslow: '700ms',
      },
      animation: {
        'spin-slow': 'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [],
}
