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

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    site_name: 'BronUz',
    support_email: 'support@bronuz.uz',
    support_phone: '+998 71 200 00 00',
    commission_rate: '8',
    min_payout: '500000',
  })
  const [features, setFeatures] = useState({
    allow_registration: true,
    require_approval: true,
    enable_promotions: false,
    enable_reviews: true,
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Sozlamalar</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platforma sozlamalarini boshqarish.</p>
      </div>

      {/* Platform settings */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Platforma sozlamalari</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" height="2.5rem" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Sayt nomi"
              name="site_name"
              value={form.site_name}
              onChange={handleFormChange}
            />
            <Input
              label="Qo'llab-quvvatlash emaili"
              name="support_email"
              value={form.support_email}
              onChange={handleFormChange}
            />
            <Input
              label="Qo'llab-quvvatlash telefoni"
              name="support_phone"
              value={form.support_phone}
              onChange={handleFormChange}
            />
            <Input
              label="Komissiya foizi (%)"
              name="commission_rate"
              type="number"
              value={form.commission_rate}
              onChange={handleFormChange}
            />
            <Input
              label="Minimal to'lov miqdori (so'm)"
              name="min_payout"
              type="number"
              value={form.min_payout}
              onChange={handleFormChange}
            />
          </div>
        )}
      </Card>

      {/* Feature toggles */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-2">Funksiyalar</h2>
        <p className="text-xs text-ink-tertiary mb-4">Platforma funksiyalarini yoqish yoki o'chirish.</p>
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
