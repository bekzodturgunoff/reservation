import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
