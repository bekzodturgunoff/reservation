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
  const { setUser, setProfile, setLoading, loading } = useAuthStore()

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 6000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          clearTimeout(timeout)
          setLoading(false)
          return
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          clearTimeout(timeout)
          setUser(session?.user ?? null)
          if (session?.user) {
            try {
              const profile = await getProfile(session.user.id)
              setProfile(profile)
            } catch {
              setProfile(null)
            }
          } else {
            setProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [setUser, setProfile, setLoading])

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
