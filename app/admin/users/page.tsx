'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Edit3, Ban, CheckCircle, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Drawer } from '@/components/shared/Drawer'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Profile } from '@/types'

const roleConfig: Record<string, { variant: BadgeVariant; className: string }> = {
  admin: { variant: 'default', className: 'bg-purple-100 text-purple-700' },
  business: { variant: 'success', className: '' },
  user: { variant: 'default', className: 'bg-surface-subtle text-ink-secondary' },
  blocked: { variant: 'error', className: '' },
}

const ROLE_OPTIONS = ['user', 'business', 'admin', 'blocked'] as const

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [blockUserId, setBlockUserId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('user')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, role, created_at')
        .order('created_at', { ascending: false })
      return (data || []) as Profile[]
    },
  })

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string; block: boolean }) => {
      const { error } = await supabase.rpc('admin_set_user_role', {
        target_user_id: id,
        new_role: block ? 'blocked' : 'user',
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setBlockUserId(null)
      toast.success(t('admin.usersPage.statusChanged'))
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.rpc('admin_set_user_role', {
        target_user_id: id,
        new_role: role,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditUser(null)
      toast.success('Rol o\'zgartirildi')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleBlockToggle = (id: string) => {
    const user = users.find(u => u.id === id)
    const isCurrentlyBlocked = user?.role === 'blocked'
    blockMutation.mutate({ id, block: !isCurrentlyBlocked })
  }

  const openEdit = (user: Profile) => {
    setSelectedRole(user.role || 'user')
    setEditUser(user)
  }

  if (isLoading) {
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
        title={t('admin.usersPage.noUsers')}
        description={t('admin.usersPage.noUsersDesc')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink">{t('admin.usersPage.title')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">{t('admin.usersPage.subtitle')}</p>
      </div>

      {/* Mobile: card view */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-xs font-semibold text-ink-tertiary shrink-0">
                  {user.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{user.full_name || t('admin.unknown')}</p>
                  <p className="text-xs text-ink-tertiary">{user.phone || '—'}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={roleConfig[user.role]?.variant || 'default'} size="sm" className={roleConfig[user.role]?.className || ''}>
                  {t(`admin.roles.${user.role}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors" aria-label={t('admin.usersPage.edit')}>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBlockUserId(user.id)}
                  className="p-1.5 rounded-lg text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                  aria-label={user.role === 'blocked' ? t('admin.usersPage.unblock') : t('admin.usersPage.block')}
                >
                  {user.role === 'blocked' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
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
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('admin.usersPage.tableUser')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('admin.usersPage.role')}</th>
              <th className="text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('admin.usersPage.registered')}</th>
              <th className="text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider px-6 py-4">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-xs font-semibold text-ink-tertiary shrink-0">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{user.full_name || t('admin.unknown')}</p>
                      <p className="text-xs text-ink-tertiary">{user.phone || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={roleConfig[user.role]?.variant || 'default'} size="sm" className={roleConfig[user.role]?.className || ''}>
                    {t(`admin.roles.${user.role}`)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-ink-secondary">
                  {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-info transition-colors"
                      aria-label={t('admin.usersPage.edit')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBlockUserId(user.id)}
                      className="p-2 rounded-xl text-ink-tertiary hover:bg-surface-subtle hover:text-error transition-colors"
                      aria-label={user.role === 'blocked' ? t('admin.usersPage.unblock') : t('admin.usersPage.block')}
                    >
                      {user.role === 'blocked' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Role edit drawer */}
      <Drawer isOpen={!!editUser} onClose={() => setEditUser(null)} title="Rolni o'zgartirish">
        {editUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-base font-semibold text-ink-tertiary">
                {editUser.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-ink">{editUser.full_name}</p>
                <p className="text-sm text-ink-tertiary">{editUser.phone || '—'}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-2 block">Rol</label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(role => (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedRole === role
                        ? 'border-brand bg-brand-50'
                        : 'border-border hover:bg-surface-bg'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-4 h-4 text-brand accent-brand"
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {role === 'user' && 'Foydalanuvchi'}
                        {role === 'business' && 'Biznes egasi'}
                        {role === 'admin' && 'Admin'}
                        {role === 'blocked' && 'Bloklangan'}
                      </p>
                      <p className="text-xs text-ink-tertiary">
                        {role === 'user' && 'Oddiy foydalanuvchi, bron qilish huquqi'}
                        {role === 'business' && 'Joylarni boshqarish, bronlarni ko\'rish'}
                        {role === 'admin' && 'To\'liq boshqaruv huquqi'}
                        {role === 'blocked' && 'Tizimga kirish taqiqlangan'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-ink-secondary hover:bg-surface-bg transition-colors"
              >
                Bekor
              </button>
              <button
                onClick={() => roleMutation.mutate({ id: editUser.id, role: selectedRole })}
                disabled={selectedRole === editUser.role}
                className="flex-1 h-11 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Saqlash
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal isOpen={!!blockUserId} onClose={() => setBlockUserId(null)} title={t('admin.usersPage.confirmBlockTitle')}>
        <p className="text-sm text-ink-secondary">
          {users.find(u => u.id === blockUserId)?.role === 'blocked' ? t('admin.usersPage.confirmUnblock') : t('admin.usersPage.confirmBlock')}
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setBlockUserId(null)}>{t('common.cancel')}</Button>
          <Button
            variant="danger"
            onClick={() => blockUserId && handleBlockToggle(blockUserId)}
            loading={blockMutation.isPending}
          >
            {users.find(u => u.id === blockUserId)?.role === 'blocked' ? t('admin.usersPage.unblock') : t('admin.usersPage.block')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
