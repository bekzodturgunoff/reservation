'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { WorkingHoursEditor, DEFAULT_WORKING_HOURS } from '@/components/venue/WorkingHoursEditor'
import type { WorkingHours } from '@/components/venue/WorkingHoursEditor'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { uploadImage, validateFile } from '@/lib/upload'
import { ROUTES } from '@/lib/constants/routes'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

const PRICING_UNITS = [
  { value: 'per_hour', label: 'Soatlik' },
  { value: 'per_session', label: 'Bir martalik' },
  { value: 'per_person', label: 'Kishi boshiga' },
  { value: 'negotiable', label: 'Kelishilgan' },
]

interface AddVenueClientProps {
  userId: string
  initialCategories: Category[]
}

export default function AddVenueClient({ userId, initialCategories }: AddVenueClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS)

  const venueSchema = useMemo(() => z.object({
    name: z.string().min(3, t('business.setup.nameMin')).max(100),
    description: z.string().max(1000).optional().default(''),
    category_id: z.string().min(1, t('business.setup.categoryRequired')),
    city: z.string().min(2, t('business.setup.cityRequired')),
    district: z.string().optional().default(''),
    address: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    price_per_slot: z.string().min(1, t('business.setup.priceRequired')).regex(/^\d+$/, t('business.setup.priceRequired')),
    pricing_unit: z.string().optional().default('per_hour'),
    max_group_size: z.string().optional().default(''),
    lat: z.string().optional().default(''),
    lng: z.string().optional().default(''),
    cancellation_policy: z.string().optional().default('flexible'),
    min_notice_hours: z.string().optional().default('2'),
  }), [t])

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['add-venue-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id, name_uz')
      return (data || []) as Pick<Category, 'id' | 'name_uz'>[]
    },
    initialData: initialCategories,
  })

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '', description: '', category_id: '', city: '', district: '',
      address: '', phone: '', price_per_slot: '', pricing_unit: 'per_hour',
      max_group_size: '', lat: '', lng: '', cancellation_policy: 'flexible', min_notice_hours: '2',
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file, `venues/${userId}`)
      if (url) {
        setPhotoUrls(prev => [...prev, url])
        toast.success('Rasm yuklandi')
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Rasm yuklashda xatolik')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const { mutate: createVenue, isPending: saving } = useMutation({
    mutationFn: async (data: z.infer<typeof venueSchema>) => {
      const { error } = await supabase.from('venues').insert({
        owner_id: userId,
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
        max_group_size: data.max_group_size ? parseInt(data.max_group_size) : null,
        lat: data.lat ? parseFloat(data.lat) : null,
        lng: data.lng ? parseFloat(data.lng) : null,
        status: 'pending',
        currency: 'UZS',
        max_advance_days: 30,
        min_notice_hours: data.min_notice_hours ? parseInt(data.min_notice_hours) : 2,
        cancellation_policy: data.cancellation_policy || 'flexible',
        opening_hours: workingHours,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-venues-count'] })
      toast.success(t('business.setup.created'))
      router.push(ROUTES.BUSINESS_VENUES)
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error'))
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={ROUTES.BUSINESS_VENUES}
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

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Narx turi
              </label>
              <select
                {...register('pricing_unit')}
                className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
              >
                {PRICING_UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Narx (UZS)"
              type="number"
              {...register('price_per_slot')}
              error={errors.price_per_slot?.message}
              placeholder="100000"
            />

            <Input
              label="Maks. kishi soni"
              type="number"
              {...register('max_group_size')}
              placeholder="10"
            />

            <Input
              label="Kenglik (lat)"
              type="text"
              {...register('lat')}
              placeholder="41.2995"
            />

            <Input
              label="Uzunlik (lng)"
              type="text"
              {...register('lng')}
              placeholder="69.2401"
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Bekor qilish siyosati
              </label>
              <select
                {...register('cancellation_policy')}
                className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
              >
                <option value="flexible">Moslashuvchan</option>
                <option value="standard">Standart</option>
                <option value="strict">Qat&apos;iy</option>
              </select>
            </div>

            <Input
              label="Min. bildirish vaqti (soat)"
              type="number"
              {...register('min_notice_hours')}
              placeholder="2"
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
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Rasmlar
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                    <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploadError && <p className="text-sm text-error">{uploadError}</p>}
              <p className="text-xs text-ink-tertiary">JPG, PNG, WebP. Maks 5 MB.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-sm font-semibold text-ink mb-4">Ish vaqti</h2>
          <WorkingHoursEditor value={workingHours} onChange={setWorkingHours} />
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link
            href={ROUTES.BUSINESS_VENUES}
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
