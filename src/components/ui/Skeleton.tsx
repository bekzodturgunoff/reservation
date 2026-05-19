import { cn } from '../../lib/utils'

const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />
}

export const VenueCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
)

export default Skeleton
