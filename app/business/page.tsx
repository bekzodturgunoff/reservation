'use client'

import { useEffect, useState } from 'react'
import { Building2, CalendarCheck, TrendingUp, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const stats = [
  { label: 'Faol joylar', value: '3', icon: Building2, color: 'text-info bg-info-bg' },
  { label: "Bugungi buyurtmalar", value: '7', icon: CalendarCheck, color: 'text-success bg-success-bg' },
  { label: 'Oylik daromad', value: '28.5 mln so\'m', icon: TrendingUp, color: 'text-brand bg-brand-pale' },
  { label: 'Yangi sharhlar', value: '12', icon: MessageSquare, color: 'text-warning bg-warning-bg' },
]

export default function BusinessDashboard() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-brand to-brand-dark">
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-white">
          Xush kelibsiz, {profile?.full_name?.split(' ')[0] || 'Foydalanuvchi'}
        </h1>
        <p className="mt-1 text-brand-light text-sm sm:text-base">
          Biznes panelga xush kelibsiz. Bugungi faoliyatingizni kuzatib boring.
        </p>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            {loading ? (
              <div className="space-y-3">
                <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="80%" height="1.5rem" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="mt-3 text-sm text-ink-tertiary">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{stat.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
