'use client'

import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, Calendar } from 'lucide-react'
import type { Profile } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ProfileClientProps {
  user: SupabaseUser
  profile: Profile | null
}

export function ProfileClient({ user, profile }: ProfileClientProps) {
  const { t } = useTranslation()

  if (!profile) {
    return (
      <EmptyState
        icon={<User className="w-12 h-12" />}
        title={t('profile.title')}
        description={t('profile.error')}
        action={{ label: t('errorBoundary.retry'), onClick: () => window.location.reload() }}
      />
    )
  }

  const infoItems = [
    { label: t('profile.fullName'), value: profile.full_name, icon: User },
    { label: t('common.email'), value: user?.email || '', icon: Mail },
    { label: t('common.phone'), value: profile.phone, icon: Phone },
    { label: t('profile.registeredAt'), value: new Date(profile.created_at).toLocaleDateString('uz-UZ'), icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-ink">{t('profile.title')}</h1>
        <Button variant="primary" size="sm">
          {t('common.edit')}
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-5 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-2xl font-bold text-brand shrink-0">
            {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">{profile.full_name}</h2>
            <p className="text-sm text-ink-tertiary capitalize">{profile.role}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-ink-tertiary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-tertiary">{item.label}</p>
                <p className="text-sm font-medium text-ink truncate">{item.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
