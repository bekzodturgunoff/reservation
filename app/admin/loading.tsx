export default function Loading() {
  return (
    <div className="min-h-[60vh] space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-card border border-border p-5 space-y-3">
            <div className="h-4 w-24 bg-surface-muted rounded" />
            <div className="h-8 w-16 bg-surface-muted rounded" />
            <div className="h-3 w-32 bg-surface-muted rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-card border border-border p-6">
        <div className="h-8 w-48 bg-surface-muted rounded-lg mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 bg-surface-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-surface-muted rounded" />
                <div className="h-3 w-1/4 bg-surface-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
