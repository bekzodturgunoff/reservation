export default function Loading() {
  return (
    <div className="min-h-[60vh] max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-surface-muted rounded-lg mb-8" />
      <div className="bg-white rounded-card border border-border p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-surface-muted rounded" />
              <div className="h-3 w-1/2 bg-surface-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
