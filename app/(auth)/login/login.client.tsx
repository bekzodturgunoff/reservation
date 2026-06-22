'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTitle } from '@/hooks/useTitle'
import { useTranslation } from 'react-i18next'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'

export function LoginClient({ returnTo = ROUTES.HOME }: { returnTo?: string }) {
  const { t } = useTranslation()
  useTitle(`${t('common.login')} — BronUz`)
  const router = useRouter()
  const { setUser, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const schema = useMemo(() => z.object({
    email: z.string().email(t('auth.validEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
  }), [t])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError('')
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      const msg = error.message === 'Invalid login credentials'
        ? t('auth.invalidCredentials')
        : error.message === 'Failed to fetch'
          ? t('auth.networkError')
          : error.message
      setLoading(false)
      setApiError(msg)
      return
    }

    if (authData.session?.user) {
      setUser(authData.session.user)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, phone, avatar_url, role, created_at')
          .eq('id', authData.session.user.id)
          .single()
        if (profile?.role === 'blocked') {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setLoading(false)
          setApiError(t('auth.accountBlocked'))
          return
        }
        setProfile(profile)
        const firstName = profile?.full_name?.trim().split(/\s+/)[0]
        toast.success(firstName ? `${t('auth.welcomeName', { name: firstName })} 👋` : `${t('auth.welcome')} 👋`)
      } catch {
        setProfile(null)
        toast.success(`${t('auth.welcome')} 👋`)
      }
    }
    router.push(returnTo)
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
              {t('auth.heroQuote')}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <p className="text-sm text-white/60 mt-2">{t('auth.testimonialUser')}</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-0.5 no-underline mb-12">
            <span className="font-display text-2xl font-extrabold text-brand-600 -tracking-[0.03em]">Bron</span>
            <span className="font-display text-2xl font-extrabold text-ink -tracking-[0.03em]">Uz</span>
          </Link>

          {/* Google SSO (commented out - not configured)
          <button className="w-full flex items-center justify-center gap-3 h-[52px] bg-white border border-line rounded-input text-sm font-medium text-ink hover:bg-surface-muted hover:border-line-strong transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google orqali kirish
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-ink-muted">yoki</span>
            <div className="flex-1 h-px bg-line" />
          </div>
          */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('common.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="login-email"
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
              {errors.email && (
                <p className="text-xs text-status-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block">
                {t('common.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-xs text-status-error mt-1">{errors.password.message}</p>
              )}
              <div className="flex justify-end mt-2">
                <button type="button" className="text-xs text-brand-600 hover:underline">
                  {t('auth.forgotPassword')}
                </button>
              </div>
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
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.loggingIn')}
                </span>
              ) : (
                t('common.login')
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-sm text-ink-tertiary text-center mt-8">
            {t('auth.noAccount')}{' '}
            <Link href={ROUTES.REGISTER} className="text-brand-600 font-medium hover:underline">
              {t('auth.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
