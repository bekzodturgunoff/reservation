'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const stats = [
  { label: 'Jami foydalanuvchilar', value: '1,284', change: '+12%', icon: Users, color: 'text-info bg-info-bg' },
  { label: 'Jami joylar', value: '342', change: '+8%', icon: Building2, color: 'text-brand bg-brand-pale' },
  { label: 'Jami buyurtmalar', value: '5,672', change: '+23%', icon: CalendarCheck, color: 'text-success bg-success-bg' },
  { label: 'Jami daromad', value: '8.2 mlrd so\'m', change: '+18%', icon: TrendingUp, color: 'text-warning bg-warning-bg' },
]

const roleData = [
  { label: 'Foydalanuvchi', value: 980, color: 'bg-ink-muted', percent: 76 },
  { label: 'Business', value: 280, color: 'bg-brand', percent: 22 },
  { label: 'Admin', value: 24, color: 'bg-purple-500', percent: 2 },
]

const recentUsers = [
  { name: 'Ali Karimov', email: 'ali@example.com', role: 'user', date: '2026-06-20' },
  { name: 'Zarina Ahmedova', email: 'zarina@example.com', role: 'business', date: '2026-06-19' },
  { name: 'Bobur Ismoilov', email: 'bobur@example.com', role: 'user', date: '2026-06-18' },
  { name: 'Malika Azizova', email: 'malika@example.com', role: 'business', date: '2026-06-17' },
  { name: 'Jasur Toshmatov', email: 'jasur@example.com', role: 'admin', date: '2026-06-16' },
]

const roleColors: Record<string, string> = {
  user: 'bg-ink-muted text-white',
  business: 'bg-brand text-white',
  admin: 'bg-purple-500 text-white',
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Platforma statistikasi va boshqaruvi.</p>
      </div>

      {/* Stats */}
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
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {stat.change}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-tertiary">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{stat.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by role */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-ink mb-4">Rollar bo'yicha foydalanuvchilar</h2>
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="rect" className="w-full h-4 rounded-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="text" width="60%" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {roleData.map((role) => (
                  <div
                    key={role.label}
                    className={role.color}
                    style={{ width: `${role.percent}%` }}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {roleData.map((role) => (
                  <div key={role.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${role.color}`} />
                      <span className="text-ink-secondary">{role.label}</span>
                    </div>
                    <span className="font-medium text-ink">{role.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Recent users */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">Oxirgi foydalanuvchilar</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circle" className="w-8 h-8" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentUsers.map((user, i) => (
                <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-surface-subtle transition-colors">
                  <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-xs font-semibold text-ink-tertiary shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                    <p className="text-xs text-ink-tertiary">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-ink-tertiary">{user.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
