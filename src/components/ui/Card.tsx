interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

const Card = ({ children, className = '', hover, onClick, padding = 'md' }: CardProps) => (
  <div
    onClick={onClick}
    className={`card ${hover ? 'card-hover' : ''} ${paddingClasses[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
)
export default Card
