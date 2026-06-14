'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface ToggleSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = useState({
    business_name: "Grand Ballroom MCHJ",
    phone: '+998 90 123 45 67',
    email: 'info@grandballroom.uz',
    address: "Amir Temur shoh ko'chasi, 15, Toshkent",
  })
  const [notifications, setNotifications] = useState({
    new_booking: true,
    booking_cancelled: true,
    new_review: false,
    weekly_report: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-display font-semibold text-ink">Sozlamalar</h1>

      {/* Business info */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Biznes ma'lumotlari</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Biznes nomi" value={form.business_name} disabled />
            <Input label="Telefon" value={form.phone} disabled />
            <Input label="Email" value={form.email} disabled />
            <Input label="Manzil" value={form.address} disabled />
          </div>
        )}
      </Card>

      {/* Notification preferences */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">Bildirishnomalar</h2>
        <p className="text-xs text-ink-tertiary mb-4">Qanday bildirishnomalarni olishni xohlaysiz?</p>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Skeleton variant="text" width="160px" />
                  <Skeleton variant="text" width="200px" />
                </div>
                <Skeleton variant="rect" className="w-11 h-6 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" loading={saving} onClick={handleSave}>
          Saqlash
        </Button>
      </div>
    </div>
  )
}
