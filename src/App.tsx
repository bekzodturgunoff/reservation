import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { getProfile } from './api/profiles'
import './lib/i18n'

const App = () => {
  const { setUser, setProfile, setLoading, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
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
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  return <RouterProvider router={router} />
}

export default App
