import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id')
  if (error) throw error
  return data
}
