import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function createProfile(profile: Profile): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  return data
}
