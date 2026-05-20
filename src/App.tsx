import { useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { getProfile } from './api/profiles'
import './lib/i18n'

const App = () => {
  const { setUser, setProfile, setLoading, logout } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        setLoading(false)
        return
      }

      if (session?.user) {
        setUser(session.user)
        try {
          const profile = await getProfile(session.user.id)
          setProfile(profile)
        } catch {
          setProfile(null)
        }
      } else {
        logout()
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            try {
              const profile = await getProfile(session.user.id)
              setProfile(profile)
            } catch {
              setProfile(null)
            }
          }
        }

        if (event === 'SIGNED_OUT') {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <RouterProvider router={router} />
}

export default App
