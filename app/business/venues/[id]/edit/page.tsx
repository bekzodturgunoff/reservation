'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { uploadImage, validateFile } from '@/lib/upload'
import toast from 'react-hot-toast'
import type { Category, Venue } from '@/types'

const PRICING_UNITS = [
  { value: 'per_hour', label: 'Soatlik' },
  { value: 'per_session', label: 'Bir martalik' },
  { value: 'per_person', label: 'Kishi boshiga' },
  { value: 'negotiable', label: 'Kelishilgan' },
]

const venueEditSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional().default(''),
  category_id: z.string().min(1, 'Kategoriya tanlang'),
  city: z.string().min(2, 'Shaharni kiriting'),
  district: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  price_per_slot: z.string().min(1, 'Narxni kiriting'),
  pricing_unit: z.string().optional().default('per_hour'),
})

export default function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue-edit', id],
    queryFn: async () => {
      const { data } = await supabase.from('venues').select('id, owner_id, category_id, name, description, address, city, phone, photos, price_per_slot, pricing_unit, status, created_at').eq('id', id).single()
      return data as Venue | null
    },
  })

  const photoUrls = [...(venue?.photos || []), ...uploadedPhotos]

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id, name_uz')
      return (data || []) as Pick<Category, 'id' | 'name_uz'>[]
    },
  })

  const form = useForm({
    resolver: zodResolver(venueEditSchema),
    values: {
      name: venue?.name || '',
      description: venue?.description || '',
      category_id: venue?.category_id?.toString() || '',
      city: venue?.city || '',
      district: venue?.district || '',
      address: venue?.address || '',
      phone: venue?.phone || '',
      price_per_slot: venue?.price_per_slot?.toString() || '',
      pricing_unit: venue?.pricing_unit || 'per_hour',
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validationError = validateFile(file)
    if (validationError) { setUploadError(validationError); return }
    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file, `venues/${id}`)
      if (url) { setUploadedPhotos(prev => [...prev, url]); toast.success('Rasm yuklandi') }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Xatolik')
    } finally { setUploading(false) }
  }

  const removePhoto = (index: number) => {
    const originalLen = (venue?.photos || []).length
    if (index < originalLen) {
      // Can't remove original photos in this version - just skip
      toast.error('Asl rasmlarni o\'chirish mumkin emas')
    } else {
      setUploadedPhotos(prev => prev.filter((_, i) => i !== index - originalLen))
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof venueEditSchema>) => {
      const { error } = await supabase.from('venues').update({
        name: data.name.trim(),
        description: data.description?.trim() || '',
        category_id: parseInt(data.category_id),
        city: data.city,
        district: data.district || null,
        address: data.address || data.city,
        phone: data.phone || '',
        price_per_slot: parseInt(data.price_per_slot) || 0,
        pricing_unit: data.pricing_unit || 'per_hour',
        photos: photoUrls,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues'] })
      toast.success('Saqlangan')
      router.push('/business/venues')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (venueLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </Card>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-ink-tertiary">Joy topilmadi</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/business/venues" className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        Joylarim
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink">{venue.name} — tahrirlash</h1>

      <form onSubmit={form.handleSubmit(data => saveMutation.mutate(data))}>
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Nomi" {...form.register('name')} error={form.formState.errors.name?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">Kategoriya</label>
              <select {...form.register('category_id')} className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand text-ink">
                <option value="">Tanlang</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
              </select>
              {form.formState.errors.category_id && <p className="mt-1 text-sm text-error">{form.formState.errors.category_id.message}</p>}
            </div>
            <div>
              <Input label="Shahar" {...form.register('city')} error={form.formState.errors.city?.message} />
            </div>
            <Input label="Tuman" {...form.register('district')} />
            <Input label="Manzil" {...form.register('address')} />
            <Input label="Telefon" {...form.register('phone')} />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">Narx turi</label>
              <select {...form.register('pricing_unit')} className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand text-ink">
                {PRICING_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <Input label="Narx (UZS)" type="number" {...form.register('price_per_slot')} error={form.formState.errors.price_per_slot?.message} />
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">Tavsif</label>
              <textarea {...form.register('description')} rows={3} className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-input outline-none focus:border-brand resize-none text-ink" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">Rasmlar</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-brand transition-colors">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-ink-muted" />
                      <span className="text-[10px] text-ink-muted mt-1">Yuklash</span>
                    </>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {uploadError && <p className="text-sm text-error">{uploadError}</p>}
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/business/venues" className="h-[48px] px-6 border border-border rounded-btn text-sm font-medium text-ink-secondary hover:bg-surface-bg transition-colors flex items-center">Bekor</Link>
          <Button variant="primary" type="submit" loading={saveMutation.isPending}>Saqlash</Button>
        </div>
      </form>
    </div>
  )
}
