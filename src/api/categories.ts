import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*')
  return data || []
}
