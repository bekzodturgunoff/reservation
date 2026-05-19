import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-gray-200', className)}
    />
  )
}

export default Skeleton
