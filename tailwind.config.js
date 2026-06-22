/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          '50': '#ECFDF5',
          '100': '#D1FAE5',
          '200': '#A7F3D0',
          '500': '#10B981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065F46',
          '900': '#022c22',
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
          disabled: '#D1D5DB',
        },
        line: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F9FAFB',
          muted: '#F3F4F6',
          bg: '#F9FAFB',
        },
        status: {
          success: { DEFAULT: '#10B981', bg: '#ECFDF5' },
          warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
          error: { DEFAULT: '#EF4444', bg: '#FEF2F2' },
          info: { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
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
        card: '20px',
        input: '12px',
        btn: '12px',
        modal: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        modal: '0 24px 80px rgba(0,0,0,0.18)',
        btn: '0 1px 2px rgba(5,150,105,0.25), 0 4px 12px rgba(5,150,105,0.18)',
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
