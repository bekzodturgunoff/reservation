'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, Eye, EyeOff, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTitle } from '@/hooks/useTitle'

const RegisterPage = () => {
  useTitle("Ro'yxatdan o'tish — BronUz")
  const router = useRouter()
  const { setUser, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'user' | 'business'>('user')
  const [apiError, setApiError] = useState('')

  const schema = useMemo(() => z.object({
    full_name: z.string().min(2, 'Ism kamida 2 belgidan iborat'),
    phone: z.string().min(9, "Noto'g'ri telefon raqam"),
    email: z.string().email("Noto'g'ri email"),
    password: z.string().min(6, 'Parol kamida 6 belgidan iborat'),
  }), [])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password', '')

  const getPasswordStrength = (pwd: string): { level: number; color: string; label: string } => {
    let points = 0
    if (pwd.length >= 6) points++
    if (pwd.length >= 10) points++
    if (/[A-Z]/.test(pwd)) points++
    if (/[0-9]/.test(pwd)) points++
    if (/[^A-Za-z0-9]/.test(pwd)) points++
    const levels = [
      { level: 0, color: 'bg-gray-200', label: '' },
      { level: 1, color: 'bg-status-error', label: 'Juda zaif' },
      { level: 2, color: 'bg-orange-500', label: 'Zaif' },
      { level: 3, color: 'bg-yellow-500', label: "O'rtacha" },
      { level: 4, color: 'bg-lime-500', label: 'Yaxshi' },
      { level: 5, color: 'bg-status-success', label: 'Kuchli' },
    ]
    return levels[points] || levels[0]
  }

  const strength = getPasswordStrength(password)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError('')
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          role,
        },
      },
    })

    if (error) {
      const msg = error.message === 'Failed to fetch'
        ? 'Tarmoq xatosi. Internet aloqasini tekshiring.'
        : error.message
      setLoading(false)
      setApiError(msg)
      return
    }

    if (authData.user) {
      setUser(authData.user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, role, created_at')
        .eq('id', authData.user.id)
        .single()
      setProfile(profile)
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉")
    }
    router.push('/')
  }

  return (
    <div className="flex flex-row min-h-screen">
      {/* LEFT PANEL - Venue photo */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(6,95,70,0.7) 0%, rgba(2,44,34,0.9) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <div className="max-w-xs mx-auto text-center">
            <p className="text-2xl font-display font-semibold text-white leading-snug">
              O'zingizga mos joyni toping va bir zumda bron qiling
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <p className="text-sm text-white/60 mt-2">Nilufar, Samarqand</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-0.5 no-underline mb-10">
            <span className="font-display text-2xl font-extrabold text-brand-600 -tracking-[0.03em]">Bron</span>
            <span className="font-display text-2xl font-extrabold text-ink -tracking-[0.03em]">Uz</span>
          </Link>

          <h1 className="text-2xl font-display font-bold text-ink">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-ink-tertiary mt-1">Hisob yarating va bron qilishni boshlang</p>

          {/* Role Toggle */}
          <div className="flex gap-3 mt-8 mb-8">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 p-4 rounded-xl border-2 text-left relative transition-all ${
                role === 'user'
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              <span className="text-xl">👤</span>
              <p className="text-sm font-semibold text-ink mt-1">Foydalanuvchi</p>
              <p className="text-xs text-ink-tertiary">Joy bron qilish uchun</p>
              {role === 'user' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setRole('business')}
              className={`flex-1 p-4 rounded-xl border-2 text-left relative transition-all ${
                role === 'business'
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              <span className="text-xl">🏢</span>
              <p className="text-sm font-semibold text-ink mt-1">Biznes egasi</p>
              <p className="text-xs text-ink-tertiary">Joy qo'shish uchun</p>
              {role === 'business' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="reg-name" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                To'liq ism
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Sardor Toshmatov"
                  autoComplete="name"
                  {...register('full_name')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border rounded-input text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.full_name
                      ? 'border-status-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                      : 'border-line focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.full_name && <p className="text-xs text-status-error mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  autoComplete="tel"
                  {...register('phone')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border rounded-input text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.phone
                      ? 'border-status-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                      : 'border-line focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-status-error mt-1">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Email manzil
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="siz@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border rounded-input text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.email
                      ? 'border-status-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                      : 'border-line focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-status-error mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                  className={`w-full h-[52px] pl-11 pr-11 bg-white border rounded-input text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.password
                      ? 'border-status-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                      : 'border-line focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-status-error mt-1">{errors.password.message}</p>}

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${
                          i <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] mt-1 ${strength.label ? 'text-ink-tertiary' : ''}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-1.5 text-sm text-status-error bg-status-error-bg rounded-xl px-4 py-3">
                <span>⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-btn shadow-btn transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>

          <p className="text-sm text-ink-tertiary text-center mt-6">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
