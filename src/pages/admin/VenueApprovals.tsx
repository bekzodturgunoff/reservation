import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, MapPin, Phone, Clock } from 'lucide-react'
import { useTitle } from '../../hooks/useTitle'
import { getPendingVenues, approveVenue, rejectVenue } from '../../api/admin'
import { formatPrice, formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useToastStore } from '../../store/toastStore'

const VenueApprovals = () => {
  useTitle('Venuelarni tasdiqlash')
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['admin', 'pending-venues'],
    queryFn: getPendingVenues,
    refetchInterval: 15000,
  })

  const approveMutation = useMutation({
    mutationFn: approveVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      addToast({ type: 'success', message: 'Venue tasdiqlandi' })
    },
    onError: () => addToast({ type: 'error', message: 'Xatolik yuz berdi' }),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      addToast({ type: 'success', message: 'Venue rad etildi' })
    },
    onError: () => addToast({ type: 'error', message: 'Xatolik yuz berdi' }),
  })

  const isMutating = (id: string) =>
    approveMutation.isPending && approveMutation.variables === id ||
    rejectMutation.isPending && rejectMutation.variables === id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Venuelarni tasdiqlash</h1>
        <p className="text-sm text-gray-500 mt-1">
          {venues.length} ta venue tasdiqlanishi kutilmoqda
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <span className="text-5xl">✅</span>
          <p className="text-gray-500 mt-4 text-lg">Barcha venuelar ko'rib chiqilgan</p>
          <p className="text-gray-400 text-sm mt-1">Yangi venue qo'shilganda sizga xabar keladi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-2xl shrink-0 border border-yellow-200">
                      {v.categories?.icon || '🏢'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-gray-500">{v.categories?.name_uz || 'Boshqa'}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{v.city}</span>
                        <span className="text-gray-300">·</span>
                        <Badge variant="warning">Kutilmoqda</Badge>
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
                      <Check className="w-4 h-4" /> Tasdiqlash
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (window.confirm(`${v.name} ni rad etishni xohlaysizmi?`)) {
                          rejectMutation.mutate(v.id)
                        }
                      }}
                      loading={rejectMutation.isPending && rejectMutation.variables === v.id}
                      disabled={isMutating(v.id)}
                    >
                      <X className="w-4 h-4" /> Rad etish
                    </Button>
                  </div>
                </div>

                {v.description && (
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">{v.description}</p>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {v.address}
                  </div>
                  {v.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {v.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {formatDate(v.created_at)}
                  </div>
                </div>

                {v.price_per_slot > 0 && (
                  <div className="mt-3">
                    <Badge variant="info">{formatPrice(v.price_per_slot)} / slot</Badge>
                  </div>
                )}

                {v.photos && v.photos.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
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
