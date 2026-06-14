'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id: externalId, ...props }, ref) => {
    const autoId = useId()
    const inputId = externalId || autoId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-all duration-fast ease-out-quart focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? 'pl-10' : ''} ${error ? 'border-error focus:border-error focus:ring-error/40' : 'border-border'} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input, type InputProps }
