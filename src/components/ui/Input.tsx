import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftIcon, rightIcon, className = '', ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-600 tracking-wide uppercase" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
    )}
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }}>
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? '!border-[var(--color-danger)] focus:!shadow-[0_0_0_3px_rgba(255,77,77,0.12)]' : ''} ${className}`}
        style={{
          ...props.style,
          paddingLeft: leftIcon ? '3.5rem' : props.style?.paddingLeft,
          paddingRight: rightIcon ? '3.5rem' : props.style?.paddingRight,
        }}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }}>
          {rightIcon}
        </span>
      )}
    </div>
    {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
    {hint && !error && <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hint}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
