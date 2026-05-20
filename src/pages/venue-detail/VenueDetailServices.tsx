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
    <div className="rounded-2xl border p-6 shadow-sm" style={{background: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5" style={{color: 'var(--color-brand)'}} />
        <h2 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>{t('venue.pricing')}</h2>
      </div>
      <p className="text-sm mb-4" style={{color: 'var(--color-text-secondary)'}}>{t('venue.selectService')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(s => {
          const isSelected = selectedService?.id === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : s)}
              className="text-left rounded-xl border-2 p-4 transition-all"
              style={{
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                background: isSelected ? 'var(--color-brand-light)' : 'var(--color-surface)',
              }}
            >
              <p className="font-semibold" style={{color: 'var(--color-text-primary)'}}>{s.name}</p>
              <p className="text-lg font-bold mt-1" style={{color: 'var(--color-brand)'}}>
                {formatPrice(s.price)}
                {s.unit !== 'fixed' && (
                  <span className="text-sm font-normal" style={{color: 'var(--color-text-tertiary)'}}>{' '}{unitLabel(s.unit, t)}</span>
                )}
              </p>
              {s.description && <p className="text-xs mt-1" style={{color: 'var(--color-text-secondary)'}}>{s.description}</p>}
              {s.duration_minutes && (
                <p className="text-xs mt-0.5" style={{color: 'var(--color-text-tertiary)'}}>{s.duration_minutes} {t('common.minute')}</p>
              )}
              {isSelected && (
                <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{color: 'var(--color-brand)'}}>
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
