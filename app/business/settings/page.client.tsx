'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

function ToggleSwitch({
  label, description, checked, onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-tertiary">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast ease-out-quart focus:outline-none focus:ring-2 focus:ring-brand/40 ${checked ? 'bg-brand' : 'bg-border-strong'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-fast ease-out-quart ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

interface VenueDefaults {
  cancellation_policy: string | null
  max_group_size: number | null
  min_notice_hours: number | null
}

interface BusinessSettingsClientProps {
  userId: string
  initialProfile: Profile | null
  initialVenueInfo: { address: string | null; phone: string | null } | null
  initialVenueDefaults: VenueDefaults | null
}

export default function BusinessSettingsClient({ userId, initialProfile, initialVenueInfo, initialVenueDefaults }: BusinessSettingsClientProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const profileSchema = useMemo(() => z.object({
    full_name: z.string().min(3, t('business.settings.nameMin')).max(100),
    phone: z.string().regex(/^\+998[0-9]{9}$/, t('business.settings.phoneFormat')),
  }), [t])

  const venueDefaultsSchema = useMemo(() => z.object({
    cancellation_policy: z.string().optional().default('flexible'),
    max_group_size: z.string().optional().default(''),
    min_notice_hours: z.string().optional().default('2'),
  }), [])

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: initialProfile?.full_name || '', phone: initialProfile?.phone || '' },
  })

  const venueDefaultsForm = useForm({
    resolver: zodResolver(venueDefaultsSchema),
    defaultValues: {
      cancellation_policy: initialVenueDefaults?.cancellation_policy || 'flexible',
      max_group_size: initialVenueDefaults?.max_group_size?.toString() || '',
      min_notice_hours: initialVenueDefaults?.min_notice_hours?.toString() || '2',
    },
  })

  const [notifications, setNotifications] = useState({
    new_booking: true,
    booking_cancelled: true,
    new_review: false,
    weekly_report: true,
  })

  const { data: venueInfo } = useQuery({
    queryKey: ['my-first-venue', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('address, phone')
        .eq('owner_id', userId)
        .limit(1)
        .single()
      return data || null
    },
    enabled: !!userId,
    initialData: initialVenueInfo,
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name.trim(), phone: data.phone.trim() })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(t('business.settings.saved'))
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error'))
    },
  })

  const { mutate: saveVenueDefaults, isPending: savingDefaults } = useMutation({
    mutationFn: async (data: { cancellation_policy: string; max_group_size: string; min_notice_hours: string }) => {
      const { data: firstVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', userId)
        .limit(1)
        .single()

      if (!firstVenue?.id) throw new Error(t('business.settings.noVenue'))

      const { error } = await supabase
        .from('venues')
        .update({
          cancellation_policy: data.cancellation_policy || 'flexible',
          max_group_size: data.max_group_size ? parseInt(data.max_group_size) : null,
          min_notice_hours: data.min_notice_hours ? parseInt(data.min_notice_hours) : 2,
        })
        .eq('id', firstVenue.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-first-venue'] })
      toast.success(t('business.settings.defaultsSaved'))
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error'))
    },
  })

  const loading = !initialProfile

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-display font-semibold text-ink">{t('business.settings.title')}</h1>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">{t('business.settings.businessInfo')}</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => saveProfile(data))} className="space-y-4">
            <Input
              label={t('business.settings.businessName')}
              {...register('full_name')}
              error={errors.full_name?.message}
              placeholder={t('business.settings.businessNamePlaceholder')}
            />
            <Input
              label={t('common.phone')}
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+998 90 123 45 67"
            />
            <Input
              label={t('business.settings.mainAddress')}
              value={venueInfo?.address || ''}
              disabled
            />
            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit" loading={saving}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">{t('business.settings.venueDefaults')}</h2>
        <p className="text-xs text-ink-tertiary mb-4">{t('business.settings.venueDefaultsDesc')}</p>
        {!initialVenueDefaults ? (
          <p className="text-sm text-ink-tertiary py-4">{t('business.settings.noVenueDefaults')}</p>
        ) : (
          <form onSubmit={venueDefaultsForm.handleSubmit((data) => saveVenueDefaults(data))} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('business.settings.defaultCancellation')}
              </label>
              <select
                {...venueDefaultsForm.register('cancellation_policy')}
                className="w-full h-[44px] px-3 text-sm bg-white border border-border rounded-input outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-shadow text-ink"
              >
                <option value="flexible">Moslashuvchan</option>
                <option value="standard">Standart</option>
                <option value="strict">Qat&apos;iy</option>
              </select>
            </div>
            <Input
              label={t('business.settings.defaultMaxGroup')}
              type="number"
              {...venueDefaultsForm.register('max_group_size')}
              placeholder="10"
            />
            <Input
              label={t('business.settings.defaultMinNotice')}
              type="number"
              {...venueDefaultsForm.register('min_notice_hours')}
              placeholder="2"
            />
            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit" loading={savingDefaults}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">{t('business.settings.notifications')}</h2>
        <p className="text-xs text-ink-tertiary mb-4">{t('business.settings.notificationsDesc')}</p>
        <div className="divide-y divide-border">
          <ToggleSwitch
            label={t('business.settings.newBooking')}
            description={t('business.settings.newBookingDesc')}
            checked={notifications.new_booking}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, new_booking: checked }))}
          />
          <ToggleSwitch
            label={t('business.settings.bookingCancelled')}
            description={t('business.settings.bookingCancelledDesc')}
            checked={notifications.booking_cancelled}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, booking_cancelled: checked }))}
          />
          <ToggleSwitch
            label={t('business.settings.newReview')}
            description={t('business.settings.newReviewDesc')}
            checked={notifications.new_review}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, new_review: checked }))}
          />
          <ToggleSwitch
            label={t('business.settings.weeklyReport')}
            description={t('business.settings.weeklyReportDesc')}
            checked={notifications.weekly_report}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, weekly_report: checked }))}
          />
        </div>
      </Card>
    </div>
  )
}
