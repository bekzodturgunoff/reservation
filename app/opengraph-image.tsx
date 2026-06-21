/* eslint-disable react-refresh/only-export-components */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'BronUz — Onlayn bron qilish'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            Bron
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '-0.03em',
            }}
          >
            Uz
          </span>
        </div>
        <p
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 24,
          }}
        >
          Onlayn bron qilish platformasi
        </p>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>Kafe</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>Restoran</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>Futbol</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>Sport</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>Coworking</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
