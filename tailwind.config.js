/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['GeistMono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          800: '#1A1A1A',
          700: '#2C2C2C',
          500: '#6B6B6B',
          400: '#A8A8A8',
          200: '#D4D4D4',
          100: '#E8E8E8',
          50: '#F5F5F5',
        },
        jade: {
          DEFAULT: '#00875A',
          800: '#006644',
          600: '#007A50',
          400: '#00A86B',
          100: '#D4F0E4',
          50: '#F0FAF5',
        },
        coral: {
          DEFAULT: '#FF4D4D',
          800: '#CC0000',
          50: '#FFE8E8',
        },
        amber: {
          DEFAULT: '#F59E0B',
          800: '#92400E',
          50: '#FEF3C7',
        },
        sapphire: {
          DEFAULT: '#3B82F6',
          800: '#1D4ED8',
          50: '#EFF6FF',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        modal: '0 24px 64px rgba(0,0,0,0.18)',
        sm: '0 1px 2px rgba(0,0,0,0.05)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}
