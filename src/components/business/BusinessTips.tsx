import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LightBulbIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const tips = [
  'tipServices',
  'tipAvailability',
  'tipPhotos',
  'tipTelegram',
  'tipDescription',
  'tipPromo',
  'tipStaff',
  'tipLocation',
  'tipLoyalty',
  'tipAI',
]

const BusinessTips = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-amber-800 text-sm">{t('business.tips.title')}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-amber-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {tips.map((key, i) => (
            <div key={key} className="flex gap-2.5">
              <span className="text-amber-500 text-sm font-bold mt-0.5 shrink-0">{i + 1}.</span>
              <p className="text-sm text-amber-900 leading-relaxed">{t(`business.tips.${key}`)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessTips
