import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

const Card = ({ children, className, onClick, hover }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card
