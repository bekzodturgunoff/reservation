import type { ReactNode, MouseEventHandler } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  hover?: boolean
}

function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-2xl shadow-card transition-all duration-fast ease-out-quart ${onClick || hover ? 'hover:shadow-card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export { Card, type CardProps }
