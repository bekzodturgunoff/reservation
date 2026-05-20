import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const sizeClasses = {
  sm:  'px-3 py-1.5 text-xs gap-1.5 rounded-lg min-h-[36px]',
  md:  'px-5 py-2.5 text-sm gap-2 rounded-xl min-h-[44px]',
  lg:  'px-6 py-3 text-base gap-2 rounded-xl min-h-[48px]',
}

const variantClasses = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'bg-transparent border-0 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2',
  danger:    'bg-[var(--color-danger)] text-white border-0 rounded-md font-medium text-sm px-5 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`${variantClasses[variant]} ${variant === 'primary' || variant === 'secondary' ? sizeClasses[size] : ''} ${className}`}
    {...props}
  >
    {loading
      ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      : icon}
    {children}
  </button>
))
Button.displayName = 'Button'
export default Button
