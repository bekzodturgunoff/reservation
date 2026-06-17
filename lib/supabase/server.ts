import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — returning no-op server client')
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}
