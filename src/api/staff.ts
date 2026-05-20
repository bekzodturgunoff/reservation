import { supabase } from '../lib/supabase'
import { handleError } from '../lib/handleError'
import type { StaffMember } from '../types'

export const getVenueStaff = async (venueId: string): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(handleError(error))
  return data
}

export const createStaff = async (params: {
  venue_id: string
  name: string
  title?: string
  services?: string[]
  photo?: string | null
}): Promise<StaffMember> => {
  const { data, error } = await supabase
    .from('staff')
    .insert(params)
    .select()
    .single()
  if (error) throw new Error(handleError(error))
  return data
}

export const updateStaff = async (
  id: string,
  params: Partial<{
    name: string
    title: string
    services: string[]
    photo: string | null
    is_active: boolean
    sort_order: number
  }>
): Promise<StaffMember> => {
  const { data, error } = await supabase
    .from('staff')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(handleError(error))
  return data
}

export const deleteStaff = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)
  if (error) throw new Error(handleError(error))
}
