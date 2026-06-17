'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, MessageSquare, Send } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

export default function BusinessReviews() {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const { data: myVenues = [] } = useQuery({
    queryKey: ['my-venue-ids', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('venues').select('id, name').eq('owner_id', profile!.id)
      return data || []
    },
    enabled: !!profile?.id,
  })
  const venueIds = myVenues.map(v => v.id)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['business-reviews', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles!user_id(full_name, avatar_url), venues!venue_id(name)')
        .in('venue_id', venueIds)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: venueIds.length > 0,
  })

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, text }: { reviewId: string; text: string }) => {
      await supabase.from('reviews').update({ owner_response: text, owner_response_at: new Date().toISOString() }).eq('id', reviewId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-reviews'] })
      toast.success('Javob saqlandi')
      setReplyingTo(null)
    },
    onError: () => toast.error('Xatolik'),
  })

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Sharhlar</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="w-10 h-10" />} title="Sharhlar yo'q" description="Hali hech qanday sharh qoldirilmagan" />
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-sm font-semibold text-ink-muted">
                    {r.profiles?.full_name?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">{r.profiles?.full_name}</p>
                    <p className="text-xs text-ink-muted">{r.venues?.name} · {new Date(r.created_at).toLocaleDateString('uz')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-secondary">{r.comment}</p>

              {r.owner_response ? (
                <div className="mt-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
                  <p className="text-xs font-semibold text-brand-700 mb-1">Sizning javobingiz:</p>
                  <p className="text-sm text-ink-secondary">{r.owner_response}</p>
                </div>
              ) : replyingTo === r.id ? (
                <div className="mt-3">
                  <textarea
                    value={replyText[r.id] || ''}
                    onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
                    placeholder="Javobingizni yozing..."
                    className="w-full h-20 px-3 py-2 text-sm border border-border rounded-xl outline-none focus:border-brand resize-none text-ink"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => replyMutation.mutate({ reviewId: r.id, text: replyText[r.id] || '' })}
                      disabled={!replyText[r.id]?.trim()}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" /> Javobni saqlash
                    </button>
                    <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 rounded-lg border border-border text-xs text-ink-secondary hover:bg-surface-muted transition-colors">Bekor</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(r.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <MessageSquare className="w-3 h-3" /> Javob yozish
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
