'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id: externalId, required, ...props }, ref) => {
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
            {required && <span className="text-error ml-0.5">*</span>}
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
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            aria-required={required ? 'true' : undefined}
            inputMode={props.type === 'number' ? 'decimal' : props.type === 'tel' ? 'tel' : props.inputMode}
            className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-all duration-fast ease-out-quart focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? 'pl-10' : ''} ${error ? 'border-error focus-visible:border-error focus-visible:ring-error/40' : 'border-border'} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error" role="alert">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input, type InputProps }
