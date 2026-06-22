'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
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

interface AdminSettingsClientProps {
  initialProfile: Profile | null
  initialStats: { totalUsers: number; businessUsers: number; pendingVenues: number } | null
}

export default function AdminSettingsClient({ initialProfile, initialStats }: AdminSettingsClientProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [features, setFeatures] = useState({
    allow_registration: true,
    require_approval: true,
    enable_promotions: false,
    enable_reviews: true,
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-settings-stats'],
    queryFn: async () => {
      const [profilesRes, venuesRes] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('venues').select('status'),
      ])
      return {
        totalUsers: profilesRes.data?.length || 0,
        businessUsers: profilesRes.data?.filter(p => p.role === 'business').length || 0,
        pendingVenues: venuesRes.data?.filter(v => v.status === 'pending').length || 0,
      }
    },
    initialData: initialStats ?? undefined,
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) throw new Error(t('admin.settingsPage.nameRequired'))
      if (!/^\+998\d{9}$/.test(phone.replace(/\s/g, ''))) throw new Error(t('admin.settingsPage.invalidPhone'))

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq('id', initialProfile?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(t('admin.settingsPage.saved'))
    },
    onError: (err: Error) => {
      toast.error(err.message || t('common.error'))
    },
  })

  const loading = !initialProfile

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">{t('admin.settingsPage.title')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">{t('admin.settingsPage.subtitle')}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">{t('admin.settingsPage.adminInfo')}</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label={t('admin.settingsPage.nameLabel')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('admin.settingsPage.namePlaceholder')}
            />
            <Input
              label={t('admin.settingsPage.phoneLabel')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('admin.settingsPage.phonePlaceholder')}
            />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">{t('admin.settingsPage.platformStats')}</h2>
        {!stats ? (
          <div className="space-y-3">
            <Skeleton variant="text" height="1rem" />
            <Skeleton variant="text" height="1rem" />
            <Skeleton variant="text" height="1rem" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-card bg-surface-bg text-center">
              <p className="text-2xl font-bold text-ink">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-ink-tertiary mt-1">{t('admin.roles.user')}</p>
            </div>
            <div className="p-4 rounded-card bg-surface-bg text-center">
              <p className="text-2xl font-bold text-brand">{stats.businessUsers.toLocaleString()}</p>
              <p className="text-xs text-ink-tertiary mt-1">{t('admin.roles.business')}</p>
            </div>
            <div className="p-4 rounded-card bg-surface-bg text-center">
              <p className="text-2xl font-bold text-warning">{stats.pendingVenues.toLocaleString()}</p>
              <p className="text-xs text-ink-tertiary mt-1">{t('admin.statsPending')}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">{t('admin.settingsPage.features')}</h2>
        <p className="text-xs text-ink-tertiary mb-4">{t('admin.settingsPage.featuresDesc')}</p>
        <div className="divide-y divide-border">
          <ToggleSwitch
            label={t('admin.settingsPage.allowRegistration')}
            description={t('admin.settingsPage.allowRegistrationDesc')}
            checked={features.allow_registration}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, allow_registration: checked }))}
          />
          <ToggleSwitch
            label={t('admin.settingsPage.requireApproval')}
            description={t('admin.settingsPage.requireApprovalDesc')}
            checked={features.require_approval}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, require_approval: checked }))}
          />
          <ToggleSwitch
            label={t('admin.settingsPage.enablePromotions')}
            description={t('admin.settingsPage.enablePromotionsDesc')}
            checked={features.enable_promotions}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, enable_promotions: checked }))}
          />
          <ToggleSwitch
            label={t('admin.settingsPage.enableReviews')}
            description={t('admin.settingsPage.enableReviewsDesc')}
            checked={features.enable_reviews}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, enable_reviews: checked }))}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" loading={saving} onClick={() => saveProfile()}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
