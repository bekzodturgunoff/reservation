import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { router } from './router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { getProfile } from './api/profiles'
import './lib/i18n'

const App = () => {
  const { t } = useTranslation()
  const { setUser, setProfile, setLoading, logout } = useAuthStore()
  const loading = useAuthStore(state => state.loading)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 4000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const profile = await getProfile(session.user.id)
          setProfile(profile)
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          try {
            const profile = await getProfile(session.user.id)
            setProfile(profile)
          } catch {
            setProfile(null)
          }
        } else {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [logout, setLoading, setProfile, setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <CalendarDaysIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-400 animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
