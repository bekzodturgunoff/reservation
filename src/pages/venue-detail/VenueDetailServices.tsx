import { TagIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../lib/utils'
import type { VenueService } from '../../types'

interface Props {
  services: VenueService[]
  selectedService: VenueService | null
  onSelect: (service: VenueService | null) => void
}

const unitLabel = (unit: string, t: (key: string) => string): string => {
  const map: Record<string, string> = {
    per_hour: t('venue.perHour'),
    per_session: '/ ' + t('common.perSession'),
    per_day: '/ ' + t('common.perDay'),
    per_month: '/ ' + t('common.perMonth'),
    per_person: '/ ' + t('common.perPerson'),
    fixed: '',
  }
  return map[unit] || ''
}

const VenueDetailServices = ({ services, selectedService, onSelect }: Props) => {
  const { t } = useTranslation()

  if (services.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900">{t('venue.pricing')}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">{t('venue.selectService')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(s => {
          const isSelected = selectedService?.id === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : s)}
              className={`text-left rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{s.name}</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">
                {formatPrice(s.price)}
                {s.unit !== 'fixed' && (
                  <span className="text-sm font-normal text-gray-400">{' '}{unitLabel(s.unit, t)}</span>
                )}
              </p>
              {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
              {s.duration_minutes && (
                <p className="text-xs text-gray-400 mt-0.5">{s.duration_minutes} {t('common.minute')}</p>
              )}
              {isSelected && (
                <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                  ✓ {t('venue.selectedService')}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default VenueDetailServices
