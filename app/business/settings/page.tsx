'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

const profileSchema = z.object({
  full_name: z.string().min(3, 'Ism kamida 3 ta harf bo\'lishi kerak').max(100),
  phone: z.string().regex(/^\+998[0-9]{9}$/, 'Telefon: +998901234567 formatida kiriting'),
})

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

export default function BusinessSettingsPage() {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name || '', phone: profile?.phone || '' },
  })
  const [notifications, setNotifications] = useState({
    new_booking: true,
    booking_cancelled: true,
    new_review: false,
    weekly_report: true,
  })

  const { data: venueInfo } = useQuery({
    queryKey: ['my-first-venue', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('address, phone')
        .eq('owner_id', profile!.id)
        .limit(1)
        .single()
      return data || null
    },
    enabled: !!profile?.id,
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name.trim(), phone: data.phone.trim() })
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
      <h1 className="text-xl font-display font-semibold text-ink">Sozlamalar</h1>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Biznes ma'lumotlari</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => saveProfile(data))} className="space-y-4">
            <Input
              label="Biznes nomi"
              {...register('full_name')}
              error={errors.full_name?.message}
              placeholder="MCHJ nomi yoki to'liq ism"
            />
            <Input
              label="Telefon"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+998 90 123 45 67"
            />
            <Input
              label="Asosiy manzil"
              value={venueInfo?.address || ''}
              disabled
            />
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">Bildirishnomalar</h2>
        <p className="text-xs text-ink-tertiary mb-4">Qanday bildirishnomalarni olishni xohlaysiz?</p>
        <div className="divide-y divide-border">
          <ToggleSwitch
            label="Yangi buyurtma"
            description="Yangi buyurtma kelganda bildirishnoma yuborish"
            checked={notifications.new_booking}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, new_booking: checked }))}
          />
          <ToggleSwitch
            label="Buyurtma bekor qilindi"
            description="Buyurtma bekor qilinganda bildirishnoma yuborish"
            checked={notifications.booking_cancelled}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, booking_cancelled: checked }))}
          />
          <ToggleSwitch
            label="Yangi sharh"
            description="Yangi sharh qoldirilganda bildirishnoma yuborish"
            checked={notifications.new_review}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, new_review: checked }))}
          />
          <ToggleSwitch
            label="Haftalik hisobot"
            description="Har hafta daromad va statistika hisobotini yuborish"
            checked={notifications.weekly_report}
            onChange={(checked) => setNotifications((prev) => ({ ...prev, weekly_report: checked }))}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" loading={saving} type="submit" onClick={handleSubmit((data) => saveProfile(data))}>
          Saqlash
        </Button>
      </div>
    </div>
  )
}
