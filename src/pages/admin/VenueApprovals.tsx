import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, XMarkIcon, MapPinIcon, PhoneIcon, ClockIcon, ShieldExclamationIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useTitle } from '../../hooks/useTitle'
import { getPendingVenues, getHumanReviewVenues, approveVenue, rejectVenue } from '../../api/admin'
import { formatPrice, formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useToastStore } from '../../store/toastStore'
import { useTranslation } from 'react-i18next'

type Tab = 'pending' | 'human'

const VenueApprovals = () => {
  const { t } = useTranslation()
  useTitle(t('admin.approvalsPage.title'))
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => (searchParams.get('tab') === 'human' ? 'human' : 'pending'))

  const switchTab = (newTab: Tab) => {
    setTab(newTab)
    setSearchParams(newTab === 'human' ? { tab: 'human' } : {})
  }

  const { data: pendingVenues = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pending-venues'],
    queryFn: getPendingVenues,
    refetchInterval: 15000,
  })

  const { data: humanVenues = [], isLoading: humanLoading } = useQuery({
    queryKey: ['admin', 'human-review-venues'],
    queryFn: getHumanReviewVenues,
    refetchInterval: 15000,
  })

  const venues = tab === 'human' ? humanVenues : pendingVenues
  const isLoading = tab === 'human' ? humanLoading : pendingLoading

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

  const isMutating = (id: string) =>
    approveMutation.isPending && approveMutation.variables === id ||
    rejectMutation.isPending && rejectMutation.variables === id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.approvalsPage.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {tab === 'pending'
            ? `${pendingVenues.length} ${t('admin.approvalsPage.waiting')}`
            : `${humanVenues.length} ${t('admin.needsAttention')}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => switchTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          {t('admin.pendingReview')}
          {pendingVenues.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">{pendingVenues.length}</span>
          )}
        </button>
        <button
          onClick={() => switchTab('human')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'human' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldExclamationIcon className="w-4 h-4" />
          {t('admin.humanReview')}
          {humanVenues.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">{humanVenues.length}</span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <span className="text-5xl">✅</span>
          <p className="text-gray-500 mt-4 text-lg">{t('admin.approvalsPage.allDone')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('admin.approvalsPage.allDoneDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                      tab === 'human'
                        ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200'
                        : 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200'
                    }`}>
                      {v.categories?.icon || '🏢'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-gray-500">{v.categories?.name_uz || t('common.other')}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{v.city}</span>
                        <span className="text-gray-300">·</span>
                        <Badge variant={tab === 'human' ? 'warning' : 'info'}>
                          {tab === 'human' ? t('admin.needsReview') : t('common.pending')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(v.id)}
                      loading={approveMutation.isPending && approveMutation.variables === v.id}
                      disabled={isMutating(v.id)}
                    >
                      <CheckIcon className="w-4 h-4" /> {t('admin.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (window.confirm(v.name + ' ' + t('admin.approvalsPage.rejectConfirm'))) {
                          rejectMutation.mutate(v.id)
                        }
                      }}
                      loading={rejectMutation.isPending && rejectMutation.variables === v.id}
                      disabled={isMutating(v.id)}
                    >
                      <XMarkIcon className="w-4 h-4" /> {t('admin.reject')}
                    </Button>
                  </div>
                </div>

                {v.description && (
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">{v.description}</p>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" /> {v.address}
                  </div>
                  {v.phone && (
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" /> {v.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> {formatDate(v.created_at)}
                  </div>
                </div>

                {v.price_per_slot > 0 && (
                  <div className="mt-3">
                    <Badge variant="info">{formatPrice(v.price_per_slot)} {t('admin.approvalsPage.perSlot')}</Badge>
                  </div>
                )}

                {v.photos && v.photos.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {v.photos.slice(0, 4).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`${v.name} photo ${i + 1}`}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                    ))}
                  </div>
                )}

                {/* AI Review Data */}
                {v.ai_review_data && tab === 'human' && (
                  <div className="mt-4 pt-4 border-t border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">{t('admin.aiReview')}</span>
                      <span className="text-xs text-gray-400">
                        ({Math.round((v.ai_review_data as any).confidence * 100)}% {t('admin.confidence')})
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {(v.ai_review_data as any).reasons?.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <InformationCircleIcon className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {v.profiles && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                      {v.profiles.full_name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">{v.profiles.full_name}</p>
                      {v.profiles.phone && <p className="text-gray-400 text-xs">{v.profiles.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VenueApprovals
