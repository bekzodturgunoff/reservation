import { useEffect } from 'react'

const descriptions: Record<string, string> = {
  '': 'BronUz — O\'zbekistondagi eng yaxshi joylarni bron qilish platformasi. Kafe, restoran, sport zallari va boshqa venue larni toping va bron qiling.',
  'common.home': 'Eng yaxshi joylarni toping va bron qiling — BronUz O\'zbekiston',
  'profile.title': 'Shaxsiy profilingizni boshqaring',
  'business.dashboard': 'Biznes panel — venue laringizni boshqaring',
  'admin.dashboard': 'Admin panel — platformani boshqaring',
  'search.title': 'Qidirish natijalari — venue larni toping',
  'booking.title': 'Bron qilish — BronUz',
  'confirmation.title': 'Bron tasdiqlandi — BronUz',
}

export const useTitle = (title: string) => {
  useEffect(() => {
    document.title = title ? `${title} | BronUz` : 'BronUz'
    const descKey = Object.keys(descriptions).find(k => title.includes(k)) || ''
    const metaDesc = document.querySelector('meta[name="description"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const desc = descriptions[descKey] || descriptions['']
    if (metaDesc) metaDesc.setAttribute('content', desc)
    if (ogDesc) ogDesc.setAttribute('content', desc)
  }, [title])
}
