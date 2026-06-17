'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
import { useMemo } from 'react'

export default function AddVenuePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const venueSchema = useMemo(() => z.object({
    name: z.string().min(3, t('business.setup.nameMin')).max(100),
    description: z.string().max(1000).optional().default(''),
    category_id: z.string().min(1, t('business.setup.categoryRequired')),
    city: z.string().min(2, t('business.setup.cityRequired')),
    district: z.string().optional().default(''),
    address: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    price_per_slot: z.string().min(1, t('business.setup.priceRequired')).regex(/^\d+$/, t('business.setup.priceRequired')),
    photos: z.string().optional().default(''),
  }), [t])

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
      toast.success(t('business.setup.created'))
      router.push('/business/venues')
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error'))
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
          {t('common.back')}
        </Link>
        <h1 className="text-xl font-display font-semibold text-ink">{t('business.setup.newTitle')}</h1>
        <p className="text-sm text-ink-tertiary mt-1">{t('business.setup.newDescription')}</p>
      </div>

      <form onSubmit={handleSubmit((data) => createVenue(data))}>
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label={t('business.setup.name')}
                {...register('name')}
                error={errors.name?.message}
                placeholder={t('business.setup.namePlaceholder')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('business.setup.category')}
              </label>
              {catsLoading ? (
                <Skeleton className="h-[44px] w-full rounded-input" />
              ) : (
                <select
                  {...register('category_id')}
                  className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
                >
                  <option value="">{t('business.setup.categoryPlaceholder')}</option>
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
              label={t('business.setup.city')}
              {...register('city')}
              error={errors.city?.message}
              placeholder={t('business.setup.cityPlaceholder')}
            />
            </div>

            <Input
              label={t('business.setup.district')}
              {...register('district')}
              placeholder="Yunusobod"
            />

            <Input
              label={t('business.setup.address')}
              {...register('address')}
              placeholder={t('business.setup.addressPlaceholder')}
            />

            <Input
              label={t('common.phone')}
              {...register('phone')}
              placeholder="+998 90 123 45 67"
            />

            <Input
              label={t('business.setup.hourlyPrice')}
              type="number"
              {...register('price_per_slot')}
              error={errors.price_per_slot?.message}
              placeholder="100000"
            />

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('business.setup.description')}
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder={t('business.setup.descriptionPlaceholder')}
                className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow resize-none text-ink placeholder:text-ink-tertiary"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label={t('business.setup.photosUrl')}
                {...register('photos')}
                placeholder={t('business.setup.photosUrlPlaceholder')}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link
            href="/business/venues"
            className="h-[48px] px-6 border border-border rounded-btn text-sm font-medium text-ink-secondary hover:bg-surface-bg transition-colors flex items-center"
          >
            {t('common.cancel')}
          </Link>
          <Button variant="primary" type="submit" loading={saving}>
            {saving ? t('common.saving') : t('business.setup.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
