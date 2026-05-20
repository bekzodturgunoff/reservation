import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ShieldCheckIcon, ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getProfiles, updateProfile } from '../../api/profiles'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { useTitle } from '../../hooks/useTitle'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import { useTranslation } from 'react-i18next'

const MASTER_ADMIN_EMAIL = 'bekzodturgunoff@gmail.com'

const AdminManagement = () => {
  const { t } = useTranslation()
  useTitle('Manage Admins')
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)
  const profile = useAuthStore(s => s.profile)

  const [authorized, setAuthorized] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const handleReAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    setAuthLoading(false)
    if (error) {
      addToast({ type: 'error', message: error.message })
      return
    }
    setAuthorized(true)
  }

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: getProfiles,
    enabled: authorized,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      updateProfile(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      addToast({ type: 'success', message: 'Role updated' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Management</h1>
              <p className="text-sm text-gray-500">Re-enter your credentials to continue</p>
            </div>
          </div>
          <form onSubmit={handleReAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder={user?.email || 'admin@example.com'}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <Button type="submit" loading={authLoading} className="w-full">
              <ShieldCheckIcon className="w-4 h-4" /> Verify & Enter
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const admins = profiles.filter(p => p.role === 'admin')
  const users = profiles.filter(p => p.role !== 'admin')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">{admins.length} admin(s) · {profiles.length} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
          Administrators
        </h2>
        {admins.length === 0 ? (
          <p className="text-sm text-gray-400">No admins found</p>
        ) : (
          <div className="space-y-2">
            {admins.map(a => {
              const isMaster = a.id === '20f1bc69-b5d7-4e16-9ecc-ddae8a6da0c0'
              return (
                <div key={a.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-800 shrink-0">
                      {a.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.full_name || 'Unknown'}
                        {isMaster && <span className="ml-2 text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Master</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{a.phone || '—'}</p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isMaster}
                    title={isMaster ? 'Master admin cannot be removed' : 'Remove admin'}
                    loading={updateRoleMutation.isPending}
                    onClick={() => updateRoleMutation.mutate({ userId: a.id, role: 'user' })}
                  >
                    <ShieldExclamationIcon className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-400">No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {u.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{u.phone || '—'}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={updateRoleMutation.isPending}
                  onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'admin' })}
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Make Admin
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminManagement
