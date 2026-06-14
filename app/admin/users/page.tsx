'use client'

import { useState, useEffect } from 'react'
import { Users, Edit3, Ban, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { BadgeVariant } from '@/components/ui/Badge'

interface MockUser {
  id: string
  name: string
  email: string
  role: 'user' | 'business' | 'admin'
  status: 'active' | 'blocked'
  joined: string
}

const roleConfig: Record<string, { label: string; variant: BadgeVariant; className: string }> = {
  admin: { label: 'Admin', variant: 'default', className: 'bg-purple-100 text-purple-700' },
  business: { label: 'Business', variant: 'success', className: '' },
  user: { label: 'Foydalanuvchi', variant: 'default', className: 'bg-surface-subtle text-ink-secondary' },
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Faol', variant: 'success' },
  blocked: { label: 'Bloklangan', variant: 'error' },
}

const mockUsers: MockUser[] = [
  { id: '1', name: 'Ali Karimov', email: 'ali@example.com', role: 'user', status: 'active', joined: '2025-03-15' },
  { id: '2', name: 'Zarina Ahmedova', email: 'zarina@example.com', role: 'business', status: 'active', joined: '2025-01-20' },
  { id: '3', name: 'Bobur Ismoilov', email: 'bobur@example.com', role: 'admin', status: 'active', joined: '2024-11-01' },
  { id: '4', name: 'Malika Azizova', email: 'malika@example.com', role: 'business', status: 'active', joined: '2025-04-10' },
  { id: '5', name: 'Jasur Toshmatov', email: 'jasur@example.com', role: 'user', status: 'blocked', joined: '2025-02-28' },
  { id: '6', name: 'Dilnoza Rahimova', email: 'dilnoza@example.com', role: 'user', status: 'active', joined: '2025-06-01' },
  { id: '7', name: 'Shavkat Mirzaev', email: 'shavkat@example.com', role: 'business', status: 'active', joined: '2025-05-15' },
  { id: '8', name: 'Lola Abdurahmonova', email: 'lola@example.com', role: 'user', status: 'blocked', joined: '2025-03-22' },
]

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<MockUser[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Card className="overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circle" className="w-8 h-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="50%" />
                </div>
                <Skeleton variant="rect" width="80px" height="24px" className="rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title="Foydalanuvchilar yo'q"
        description="Hozircha hech qanday foydalanuvchi mavjud emas."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">Foydalanuvchilar</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Barcha foydalanuvchilarni boshqarish.</p>
      </div>

      {/* Mobile: card view */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-xs font-semibold text-ink-tertiary shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                  <p className="text-xs text-ink-tertiary">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={roleConfig[user.role].variant} size="sm" className={roleConfig[user.role].className}>
                  {roleConfig[user.role].label}
                </Badge>
                <Badge variant={statusConfig[user.status].variant} size="sm">
                  {statusConfig[user.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors">
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Foydalanuvchi</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Roli</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Holat</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Ro'yxatdan o'tgan</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-xs font-semibold text-ink-tertiary shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{user.name}</p>
                      <p className="text-xs text-ink-tertiary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={roleConfig[user.role].variant} size="sm" className={roleConfig[user.role].className}>
                    {roleConfig[user.role].label}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[user.status].variant} size="sm">
                    {statusConfig[user.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-ink-secondary">{user.joined}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                      title={user.status === 'active' ? 'Bloklash' : 'Blokdan chiqarish'}
                    >
                      {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
