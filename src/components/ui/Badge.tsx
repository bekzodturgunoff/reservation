export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: { bg: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' },
  success: { bg: 'var(--color-brand-light)', color: '#006644', border: 'var(--color-brand-light)' },
  danger:  { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', border: 'var(--color-danger-light)' },
  warning: { bg: 'var(--color-warning-light)', color: '#92400E', border: 'var(--color-warning-light)' },
  info:    { bg: 'var(--color-info-light)', color: 'var(--color-info)', border: 'var(--color-info-light)' },
}

const Badge = ({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) => {
  const s = variantStyles[variant]
  return (
    <span className={className} style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: '6px',
      fontSize: size === 'sm' ? '10px' : '11px',
      fontWeight: 600,
      padding: size === 'sm' ? '1px 6px' : '2px 8px',
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  )
}
export default Badge
