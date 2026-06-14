'use client'

interface SearchMapProps {
  venues: { id: string; name: string; lat: number | null; lng: number | null; city: string }[]
}

export function SearchMap({ venues }: SearchMapProps) {
  const withCoords = venues.filter((v) => v.lat && v.lng)

  if (withCoords.length === 0) {
    return (
      <div className="w-full h-[400px] lg:h-full bg-surface-subtle rounded-card flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-surface-bg flex items-center justify-center">
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-ink-tertiary">Xaritada ko'rsatish uchun ma'lumot yo'q</p>
        </div>
      </div>
    )
  }

  const center = withCoords[0]
  return (
    <div className="w-full h-[400px] lg:h-full rounded-card overflow-hidden">
      <iframe
        src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=13&output=embed`}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        title="Xarita"
      />
    </div>
  )
}
