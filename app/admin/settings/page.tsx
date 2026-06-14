'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

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

export default function AdminSettingsPage() {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
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
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) throw new Error('Ism majburiy')
      if (!/^\+998\d{9}$/.test(phone.replace(/\s/g, ''))) throw new Error('Telefon raqam noto\'g\'ri formatda')

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq('id', profile!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Sozlamalar saqlandi')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Xatolik yuz berdi')
    },
  })

  const loading = !profile

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Sozlamalar</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platforma sozlamalarini boshqarish.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Admin ma'lumotlari</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Ism"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Admin ismi"
            />
            <Input
              label="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
            />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Platforma statistikasi</h2>
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
              <p className="text-xs text-ink-tertiary mt-1">Foydalanuvchilar</p>
            </div>
            <div className="p-4 rounded-card bg-surface-bg text-center">
              <p className="text-2xl font-bold text-brand">{stats.businessUsers.toLocaleString()}</p>
              <p className="text-xs text-ink-tertiary mt-1">Business</p>
            </div>
            <div className="p-4 rounded-card bg-surface-bg text-center">
              <p className="text-2xl font-bold text-warning">{stats.pendingVenues.toLocaleString()}</p>
              <p className="text-xs text-ink-tertiary mt-1">Kutilayotgan joylar</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">Funksiyalar</h2>
        <p className="text-xs text-ink-tertiary mb-4">Platforma funksiyalarini yoqish yoki o'chirish.</p>
        <div className="divide-y divide-border">
          <ToggleSwitch
            label="Ro'yxatdan o'tish"
            description="Yangi foydalanuvchilarning ro'yxatdan o'tishiga ruxsat berish"
            checked={features.allow_registration}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, allow_registration: checked }))}
          />
          <ToggleSwitch
            label="Tasdiqlash talab qilinsin"
            description="Yangi joylar avtomatik faollashmasin, admin tasdiqlashi kerak"
            checked={features.require_approval}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, require_approval: checked }))}
          />
          <ToggleSwitch
            label="Promo aksiyalar"
            description="Biznes egalariga promo aksiyalar yaratishga ruxsat berish"
            checked={features.enable_promotions}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, enable_promotions: checked }))}
          />
          <ToggleSwitch
            label="Sharhlar"
            description="Foydalanuvchilarga joylarga sharh qoldirishga ruxsat berish"
            checked={features.enable_reviews}
            onChange={(checked) => setFeatures((prev) => ({ ...prev, enable_reviews: checked }))}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" loading={saving} onClick={() => saveProfile()}>
          Saqlash
        </Button>
      </div>
    </div>
  )
}
