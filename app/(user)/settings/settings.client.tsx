'use client'

import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useTitle } from '@/hooks/useTitle'
import type { Profile } from '@/types'

interface SettingsClientProps {
  profile: Profile | null
}

export function SettingsClient({ profile }: SettingsClientProps) {
  useTitle('Sozlamalar — BronUz')
  const queryClient = useQueryClient()

  const profileSchema = useMemo(() => z.object({
    full_name: z.string().min(3, 'Ism kamida 3 ta belgidan iborat bo\'lishi kerak').max(100),
    phone: z.string().regex(/^\+998[0-9]{9}$/, 'Telefon +998XXXXXXXXX formatida bo\'lishi kerak'),
  }), [])

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name || '', phone: profile?.phone || '' },
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name.trim(), phone: data.phone.trim() })
        .eq('id', profile?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Sozlamalar saqlandi')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Xatolik yuz berdi')
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-semibold text-ink">Sozlamalar</h1>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Shaxsiy ma'lumotlar</h2>
        <form onSubmit={handleSubmit((data) => saveProfile(data))} className="space-y-4">
          <Input
            label="To'liq ism"
            {...register('full_name')}
            error={errors.full_name?.message}
          />
          <Input
            label="Telefon"
            placeholder="+998901234567"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              Saqlash
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
