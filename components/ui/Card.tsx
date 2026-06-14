import type { ReactNode, MouseEventHandler, KeyboardEvent } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  hover?: boolean
}

function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const isInteractive = !!onClick

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={`bg-surface border border-border rounded-2xl shadow-card transition-all duration-fast ease-out-quart ${onClick || hover ? 'hover:shadow-card-hover' : ''} ${isInteractive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40' : onClick || hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export { Card, type CardProps }
