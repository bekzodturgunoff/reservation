'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setProfile, setLoading, setInitialized, logout } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        setLoading(false)
        setInitialized(true)
        return
      }

      if (session?.user) {
        setUser(session.user)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, phone, avatar_url, role, created_at')
            .eq('id', session.user.id)
            .single()
          setProfile(profile as Profile | null)
        } catch {
          setProfile(null)
        }
      } else {
        logout()
      }
      setLoading(false)
      setInitialized(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, phone, avatar_url, role, created_at')
                .eq('id', session.user.id)
                .single()
              setProfile(profile as Profile | null)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
