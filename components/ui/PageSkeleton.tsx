export function PageSkeleton() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-8 w-64 bg-surface-muted rounded-lg mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-card border border-border overflow-hidden">
            <div className="h-[200px] bg-surface-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-surface-muted rounded" />
              <div className="h-4 w-1/2 bg-surface-muted rounded" />
              <div className="h-4 w-1/4 bg-surface-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
