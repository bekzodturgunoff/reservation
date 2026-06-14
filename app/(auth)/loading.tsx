export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="h-10 w-48 bg-surface-muted rounded-lg mx-auto animate-pulse" />
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-surface-muted rounded mb-2" />
              <div className="h-[52px] w-full bg-surface-muted rounded-xl" />
            </div>
          ))}
          <div className="h-[52px] w-full bg-surface-muted rounded-xl mt-2" />
        </div>
      </div>
    </div>
  )
}
