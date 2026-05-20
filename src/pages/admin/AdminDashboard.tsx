import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BuildingOffice2Icon, UsersIcon, CalendarDaysIcon, ClockIcon, CheckIcon, XMarkIcon, ArrowRightIcon, ShieldExclamationIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useTitle } from '../../hooks/useTitle'
import { getAdminStats, getPendingVenues, approveVenue, rejectVenue } from '../../api/admin'
import { formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useToastStore } from '../../store/toastStore'
import { useTranslation } from 'react-i18next'

const AdminDashboard = () => {
  const { t } = useTranslation()
  useTitle(t('admin.dashboard'))
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    refetchInterval: 30000,
  })

  const { data: pendingVenues = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pending-venues'],
    queryFn: getPendingVenues,
  })

  const recentPending = useMemo(() => pendingVenues.slice(0, 5), [pendingVenues])

  const approveMutation = useMutation({
    mutationFn: approveVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      addToast({ type: 'success', message: t('admin.venueApproved') })
    },
    onError: () => addToast({ type: 'error', message: t('common.error') }),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      addToast({ type: 'success', message: t('admin.venueRejected') })
    },
    onError: () => addToast({ type: 'error', message: t('common.error') }),
  })

  const statCards = [
    { icon: <BuildingOffice2Icon className="w-5 h-5 text-emerald-600" />, label: t('admin.statsVenues'), value: stats?.totalVenues ?? '—', bg: 'bg-emerald-50' },
    { icon: <UsersIcon className="w-5 h-5 text-blue-600" />, label: t('admin.statsUsers'), value: stats?.totalUsers ?? '—', bg: 'bg-blue-50' },
    { icon: <CalendarDaysIcon className="w-5 h-5 text-purple-600" />, label: t('admin.statsBookings'), value: stats?.totalBookings ?? '—', bg: 'bg-purple-50' },
    { icon: <ClockIcon className="w-5 h-5 text-yellow-600" />, label: t('admin.statsPending'), value: stats?.pendingVenues ?? '—', bg: 'bg-yellow-50' },
    { icon: <ShieldExclamationIcon className="w-5 h-5 text-orange-600" />, label: t('admin.statsHumanReview'), value: stats?.humanReviewVenues ?? '—', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.subtitle')}</p>
        </div>
        <Link to="/admin/approvals">
          <Button><ShieldExclamationIcon className="w-4 h-4" /> {t('admin.approvals')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-gray-100`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">{card.icon}</div>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.recentPending')}</h2>
            {pendingVenues.length > 5 && (
              <Link to="/admin/approvals" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                {t('common.viewAll')} <ArrowRightIcon className="w-3 h-3" />
              </Link>
            )}
          </div>
          {pendingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : recentPending.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
              <span className="text-4xl">✅</span>
              <p className="text-gray-500 mt-2">{t('admin.allPendingReviewed')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPending.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-lg shrink-0">
                        {v.categories?.icon || '🏢'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{v.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {v.profiles?.full_name || t('admin.unknown')} · {v.city} · {formatDate(v.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => approveMutation.mutate(v.id)}
                        disabled={approveMutation.isPending}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                        title={t('admin.approve')}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(v.id)}
                        disabled={rejectMutation.isPending}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        title={t('admin.reject')}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
          <div className="space-y-3">
            <Link to="/admin/approvals" className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t('admin.pendingReview')}</p>
                  <p className="text-xs text-gray-500">
                    {pendingVenues.length} {t('admin.pendingCount')}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </Link>
            {stats && stats.humanReviewVenues > 0 && (
              <Link to="/admin/approvals?tab=human" className="flex items-center justify-between bg-white rounded-2xl border border-orange-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <ShieldExclamationIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t('admin.humanReview')}</p>
                    <p className="text-xs text-gray-500">
                      {stats.humanReviewVenues} {t('admin.needsAttention')}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            <Link to="/business/dashboard" className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t('admin.allVenues')}</p>
                  <p className="text-xs text-gray-500">
                    {stats?.totalVenues ?? '—'} {t('admin.venueCount')}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/admin/manage-admins" className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Manage Admins</p>
                  <p className="text-xs text-gray-500">Add or remove administrators</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
