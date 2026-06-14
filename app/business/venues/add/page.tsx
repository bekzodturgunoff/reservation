'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

const venueSchema = z.object({
  name: z.string().min(3, 'Joy nomi kamida 3 ta harf bo\'lishi kerak').max(100),
  description: z.string().max(1000).optional().default(''),
  category_id: z.string().min(1, 'Kategoriya tanlang'),
  city: z.string().min(2, 'Shahar nomini kiriting'),
  district: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  price_per_slot: z.string().min(1, 'Narxni kiriting').regex(/^\d+$/, 'Faqat raqam kiriting'),
  photos: z.string().optional().default(''),
})

export default function AddVenuePage() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['add-venue-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id, name_uz')
      return (data || []) as Pick<Category, 'id' | 'name_uz'>[]
    },
  })

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '', description: '', category_id: '', city: '', district: '',
      address: '', phone: '', price_per_slot: '', photos: '',
    },
  })

  const { mutate: createVenue, isPending: saving } = useMutation({
    mutationFn: async (data: z.infer<typeof venueSchema>) => {
      const { error } = await supabase.from('venues').insert({
        owner_id: profile!.id,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        category_id: parseInt(data.category_id),
        city: data.city,
        district: data.district || null,
        address: data.address || data.city,
        phone: data.phone || '',
        price_per_slot: parseInt(data.price_per_slot) || 0,
        photos: data.photos ? data.photos.split(',').map(s => s.trim()).filter(Boolean) : [],
        status: 'pending',
        currency: 'UZS',
        pricing_unit: 'per_hour',
        max_advance_days: 30,
        min_notice_hours: 2,
        cancellation_policy: 'flexible',
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues-count'] })
      toast.success('Joy qo\'shildi va tekshiruvga yuborildi')
      router.push('/business/venues')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Xatolik yuz berdi')
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/business/venues"
          className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </Link>
        <h1 className="text-xl font-display font-semibold text-ink">Yangi joy qo'shish</h1>
        <p className="text-sm text-ink-tertiary mt-1">Venue ma'lumotlarini to'ldiring va tekshiruvga yuboring.</p>
      </div>

      <form onSubmit={handleSubmit((data) => createVenue(data))}>
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Joy nomi *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Masalan: Grand Ballroom"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Kategoriya *
              </label>
              {catsLoading ? (
                <Skeleton className="h-[44px] w-full rounded-input" />
              ) : (
                <select
                  {...register('category_id')}
                  className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
                >
                  <option value="">Tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name_uz}</option>
                  ))}
                </select>
              )}
              {errors.category_id && (
                <p className="mt-1 text-sm text-error" role="alert">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <Input
                label="Shahar *"
                {...register('city')}
                error={errors.city?.message}
                placeholder="Toshkent"
              />
            </div>

            <Input
              label="Tuman"
              {...register('district')}
              placeholder="Yunusobod"
            />

            <Input
              label="Manzil"
              {...register('address')}
              placeholder="Ko'cha, uy raqami"
            />

            <Input
              label="Telefon"
              {...register('phone')}
              placeholder="+998 90 123 45 67"
            />

            <Input
              label="Soatlik narx (UZS) *"
              type="number"
              {...register('price_per_slot')}
              error={errors.price_per_slot?.message}
              placeholder="100000"
            />

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Tavsif
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Joy haqida qisqacha ma'lumot..."
                className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow resize-none text-ink placeholder:text-ink-tertiary"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Rasm URL lari (vergul bilan ajrating)"
                {...register('photos')}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link
            href="/business/venues"
            className="h-[48px] px-6 border border-border rounded-btn text-sm font-medium text-ink-secondary hover:bg-surface-bg transition-colors flex items-center"
          >
            Bekor qilish
          </Link>
          <Button variant="primary" type="submit" loading={saving}>
            {saving ? 'Saqlanmoqda...' : 'Joyni qo\'shish'}
          </Button>
        </div>
      </form>
    </div>
  )
}
