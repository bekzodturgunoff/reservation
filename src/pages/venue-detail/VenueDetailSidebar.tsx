import { MapPinIcon, TagIcon, StarIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../lib/utils'
import Button from '../../components/ui/Button'
import type { Slot, Venue, VenueService, StaffMember, CancellationPolicy } from '../../types'

interface Props {
  venue: Venue
  effectivePrice: number
  effectiveUnit: string
  selectedService: VenueService | null
  selectedSlot: Slot | null
  selectedStaff: StaffMember | null
  staff: StaffMember[]
  user: unknown
  onBook: () => void
  onStaffSelect: (staff: StaffMember) => void
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

const cancellationConfig: Record<CancellationPolicy, { label: string; color: string; desc: string }> = {
  flexible: { label: 'Flexible', color: 'bg-green-100 text-green-700', desc: 'Free cancellation up to 24 hours before' },
  standard: { label: 'Standard', color: 'bg-yellow-100 text-yellow-700', desc: '50% refund up to 12 hours before' },
  strict: { label: 'Strict', color: 'bg-red-100 text-red-700', desc: 'No cancellation within 24 hours' },
}

const VenueDetailSidebar = ({ venue, effectivePrice, effectiveUnit, selectedService, selectedSlot, selectedStaff, staff, user, onBook, onStaffSelect }: Props) => {
  const { t } = useTranslation()
  const cc = cancellationConfig[venue.cancellation_policy] || cancellationConfig.flexible

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">{t('common.book')}</h3>
      <p className="text-sm text-gray-500 mb-4">{venue.name}</p>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          {venue.city}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <TagIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-emerald-600">{formatPrice(effectivePrice)}</span>
          {effectiveUnit !== 'fixed' && (
            <span className="text-gray-400">{unitLabel(effectiveUnit, t)}</span>
          )}
        </div>
        {selectedService && (
          <div className="flex items-center gap-2 text-gray-600">
            <StarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{selectedService.name}</span>
          </div>
        )}
        {selectedSlot && (
          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            {selectedSlot.start_time.slice(0, 5)} — {selectedSlot.end_time.slice(0, 5)}
          </div>
        )}
        {selectedStaff && (
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{selectedStaff.name}</span>
          </div>
        )}
      </div>

      {/* Staff selection */}
      {staff.length > 0 && (
        <div className="border-t border-gray-100 my-4 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Choose staff (optional)</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {staff.filter(s => s.is_active).map(s => (
              <button
                key={s.id}
                onClick={() => onStaffSelect(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  selectedStaff?.id === s.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                  {s.name.charAt(0)}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  {s.title && <p className="text-xs text-gray-400 truncate">{s.title}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation policy badge */}
      <div className="border-t border-gray-100 my-4 pt-4">
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cc.color}`}>
          <ShieldCheckIcon className="w-3 h-3" />
          {cc.label}
        </div>
        <p className="text-xs text-gray-400 mt-1">{cc.desc}</p>
      </div>

      <div className="border-t border-gray-100 my-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">{t('venue.total')}:</span>
          <span className="text-xl font-bold text-gray-900">
            {selectedSlot ? formatPrice(effectivePrice) : '—'}
          </span>
        </div>

        <Button className="w-full" size="lg" disabled={!selectedSlot} onClick={onBook}>
          {user ? (selectedSlot ? t('common.book') : t('venue.selectTime')) : t('venue.loginToBook')}
        </Button>

        {!user && (
          <p className="text-xs text-gray-400 text-center mt-3">{t('venue.loginToBookDesc')}</p>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
        <p className="text-xs text-yellow-700 text-center">{t('venue.paymentNote')}</p>
      </div>
    </div>
  )
}

export default VenueDetailSidebar
