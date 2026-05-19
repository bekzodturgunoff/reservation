import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

export default Card
