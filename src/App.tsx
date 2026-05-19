import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { router } from './router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { getProfile } from './api/profiles'
import './lib/i18n'

const App = () => {
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
