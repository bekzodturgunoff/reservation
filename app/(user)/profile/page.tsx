'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, Calendar } from 'lucide-react'
import type { Profile } from '@/types'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }

    loadProfile().catch(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-40 w-full" />
        <div className="space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <EmptyState
        icon={<User className="w-12 h-12" />}
        title="Profil topilmadi"
        description="Profil ma'lumotlarini yuklashda xatolik yuz berdi."
        action={{ label: 'Qayta urinish', onClick: () => window.location.reload() }}
      />
    )
  }

  const infoItems = [
    { label: 'Ism familiya', value: profile.full_name, icon: User },
    { label: 'Email', value: user?.email || '', icon: Mail },
    { label: 'Telefon', value: profile.phone, icon: Phone },
    { label: "Ro'yxatdan o'tilgan", value: new Date(profile.created_at).toLocaleDateString('uz-UZ'), icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-ink">Shaxsiy ma&apos;lumotlar</h1>
        <Button variant="primary" size="sm">
          Tahrirlash
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
