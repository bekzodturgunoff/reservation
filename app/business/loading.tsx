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
        <div className="h-[300px] bg-surface-muted rounded-xl" />
      </div>
    </div>
  )
}
