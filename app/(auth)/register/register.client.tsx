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
import { useTranslation } from 'react-i18next'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'

export const RegisterClient = () => {
  const { t } = useTranslation()
  useTitle(`${t('common.register')} — BronUz`)
  const router = useRouter()
  const { setUser, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'user' | 'business'>('user')
  const [apiError, setApiError] = useState('')

  const schema = useMemo(() => z.object({
    full_name: z.string().min(2, t('auth.nameMin')),
    phone: z.string().min(9, t('auth.invalidPhone')),
    email: z.string().email(t('auth.validEmail')),
    password: z.string().min(8, t('auth.passwordMin')),
  }), [t])

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
      { level: 1, color: 'bg-status-error', label: t('auth.passwordStrength.veryWeak') },
      { level: 2, color: 'bg-orange-500', label: t('auth.passwordStrength.weak') },
      { level: 3, color: 'bg-yellow-500', label: t('auth.passwordStrength.average') },
      { level: 4, color: 'bg-lime-500', label: t('auth.passwordStrength.good') },
      { level: 5, color: 'bg-status-success', label: t('auth.passwordStrength.strong') },
    ]
    return levels[points] ?? { level: 0, color: 'bg-status-error', label: t('auth.passwordStrength.veryWeak') }
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
        ? t('auth.networkError')
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
      toast.success(t('auth.registerSuccess'))
    }
    router.push(ROUTES.HOME)
  }

  return (
    <div className="flex flex-row min-h-screen">
      {/* LEFT PANEL - Venue photo */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${PLACEHOLDER_IMAGE})`,
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
              {t('auth.registerHeroQuote')}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <p className="text-sm text-white/60 mt-2">{t('auth.registerTestimonialUser')}</p>
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

          <h1 className="text-2xl font-display font-bold text-ink">{t('common.register')}</h1>
          <p className="text-sm text-ink-tertiary mt-1">{t('auth.registerSubtitle')}</p>

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
              <p className="text-sm font-semibold text-ink mt-1">{t('auth.user')}</p>
              <p className="text-xs text-ink-tertiary">{t('auth.userDesc')}</p>
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
              <p className="text-sm font-semibold text-ink mt-1">{t('auth.business')}</p>
              <p className="text-xs text-ink-tertiary">{t('auth.businessDesc')}</p>
              {role === 'business' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="reg-name" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('common.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder={t('auth.namePlaceholder')}
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
                {t('common.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder={t('auth.phonePlaceholder')}
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
                {t('common.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
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
                {t('common.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
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
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                t('common.register')
              )}
            </button>
          </form>

          <p className="text-sm text-ink-tertiary text-center mt-6">
            {t('auth.haveAccount')}{' '}
            <Link href={ROUTES.LOGIN} className="text-brand-600 font-medium hover:underline">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
