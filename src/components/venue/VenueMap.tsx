import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import type { Venue } from '../../types'
import { formatPrice } from '../../lib/utils'
import { useTranslation } from 'react-i18next'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createCustomIcon = (emoji: string) => {
  const isDark = document.documentElement.classList.contains('dark')
  const bg = isDark ? '#1e293b' : 'white'
  const borderColor = isDark ? '#34d399' : '#059669'
  return L.divIcon({
    html: `<div style="
      background: ${bg};
      border: 2px solid ${borderColor};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">
      <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
    </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -40],
  })
}

const userIcon = L.divIcon({
  html: `<div style="
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

interface VenueMapProps {
  venues: Venue[]
  userLocation?: { lat: number; lng: number } | null
}

const VenueMap = ({ venues, userLocation }: VenueMapProps) => {
  const { t } = useTranslation()
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [41.2995, 69.2401]

  const venuesWithCoords = venues.filter(v => v.lat && v.lng)

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={userLocation ? 13 : 12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>{t('search.yourLocation')}</Popup>
          </Marker>
        )}
        {venuesWithCoords.map(venue => (
          <Marker
            key={venue.id}
            position={[venue.lat!, venue.lng!]}
            icon={createCustomIcon(venue.categories?.icon || '🏢')}
          >
            <Popup maxWidth={240} className="venue-popup">
              <div className="p-1">
                {venue.photos?.[0] && (
                  <img
                    src={venue.photos[0]}
                    alt={venue.name}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{venue.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{venue.address}</p>
                <p className="text-xs font-semibold text-emerald-600 mb-2">
                  {formatPrice(venue.price_per_slot, venue.currency)}{t('common.perHour')}
                </p>
                <Link
                  to={`/venues/${venue.id}`}
                  className="block w-full text-center bg-emerald-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {t('venue.viewDetails')}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default VenueMap
