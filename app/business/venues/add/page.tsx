'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const categories = [
  { id: 1, name: "Restoran" },
  { id: 2, name: "Kafe" },
  { id: 3, name: "Banket zali" },
  { id: 4, name: "Ochiq maydon" },
  { id: 5, name: "Ofis" },
  { id: 6, name: "Studiya" },
]

export default function AddVenuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    city: '',
    district: '',
    address: '',
    price_per_slot: '',
    photos: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    router.push('/business/venues')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/business/venues"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Joylarimga qaytish
        </Link>
        <h1 className="mt-2 text-xl font-display font-semibold text-ink">Yangi joy qo'shish</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Barcha maydonlarni to'ldiring va joyni qo'shing.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Joy nomi"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Masalan: Grand Ballroom"
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">Tavsif</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Joy haqida qisqacha ma'lumot"
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-all duration-fast ease-out-quart focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 resize-none"
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">Kategoriya</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink transition-all duration-fast ease-out-quart focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
              required
            >
              <option value="">Kategoriyani tanlang</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shahar"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Toshkent"
              required
            />
            <Input
              label="Tuman"
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="Mirzo Ulug'bek"
            />
          </div>

          <Input
            label="Manzil"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Ko'cha, uy raqami"
            required
          />

          <Input
            label="Slot narxi (so'm)"
            name="price_per_slot"
            type="number"
            value={form.price_per_slot}
            onChange={handleChange}
            placeholder="500000"
            required
          />

          <Input
            label="Rasmlar URL (vergul bilan ajrating)"
            name="photos"
            value={form.photos}
            onChange={handleChange}
            placeholder="https://example.com/photo1.jpg, https://..."
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              Saqlash
            </Button>
            <Link href="/business/venues">
              <Button type="button" variant="secondary">
                Bekor qilish
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
