export const colors = {
  ink: {
    DEFAULT: '#0A0A0A',
    800: '#1A1A1A',
    700: '#2C2C2C',
    500: '#6B6B6B',
    400: '#A8A8A8',
    200: '#D4D4D4',
    100: '#E8E8E8',
    50:  '#F5F5F5',
  },
  jade: {
    DEFAULT: '#00875A',
    800: '#006644',
    600: '#007A50',
    400: '#00A86B',
    100: '#D4F0E4',
    50:  '#F0FAF5',
  },
  coral: {
    DEFAULT: '#FF4D4D',
    800: '#CC0000',
    50:  '#FFE8E8',
  },
  amber: {
    DEFAULT: '#F59E0B',
    800: '#92400E',
    50:  '#FEF3C7',
  },
  sapphire: {
    DEFAULT: '#3B82F6',
    800: '#1D4ED8',
    50:  '#EFF6FF',
  },
} as const

export const radius = {
  sm:  '6px',
  md:  '10px',
  lg:  '14px',
  xl:  '20px',
  full: '9999px',
} as const

export const shadow = {
  card:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover:  '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
  modal:      '0 24px 64px rgba(0,0,0,0.18)',
  sm:         '0 1px 2px rgba(0,0,0,0.05)',
} as const

export const transition = {
  fast:   '150ms ease',
  base:   '200ms ease',
  slow:   '300ms ease',
} as const

export const typography = {
  display: { size: '48px', weight: '700', tracking: '-0.03em', lineHeight: '1.1' },
  h1:      { size: '32px', weight: '600', tracking: '-0.02em', lineHeight: '1.2' },
  h2:      { size: '24px', weight: '600', tracking: '-0.01em', lineHeight: '1.3' },
  h3:      { size: '18px', weight: '500', tracking: '0',       lineHeight: '1.4' },
  body:    { size: '15px', weight: '400', tracking: '0',       lineHeight: '1.6' },
  small:   { size: '13px', weight: '400', tracking: '0',       lineHeight: '1.5' },
  caption: { size: '12px', weight: '400', tracking: '0.01em',  lineHeight: '1.4' },
  label:   { size: '11px', weight: '600', tracking: '0.06em',  lineHeight: '1' },
} as const
