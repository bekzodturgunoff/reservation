'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTitle } from '@/hooks/useTitle'

const LoginPage = () => {
  const { t } = useTranslation()
  useTitle('Kirish — BronUz')
  const router = useRouter()
  const { setUser, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(() => z.object({
    email: z.string().email(t('auth.validEmail', 'Noto\'g\'ri email')),
    password: z.string().min(6, t('auth.passwordMin', 'Parol kamida 6 belgidan iborat bo\'lishi kerak')),
  }), [t])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? "Email yoki parol noto'g'ri"
        : error.message
      )
      setLoading(false)
      return
    }

    if (authData.session?.user) {
      setUser(authData.session.user)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.session.user.id)
          .single()
        setProfile(profile)
        const firstName = profile?.full_name?.trim().split(/\s+/)[0]
        toast.success(firstName
          ? `Xush kelibsiz, ${firstName}!`
          : t('auth.welcome', 'Xush kelibsiz!')
        )
      } catch {
        setProfile(null)
        toast.success(t('auth.welcome', 'Xush kelibsiz!'))
      }
    }
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-darker">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-2xl font-bold text-white">BronUz</span>
            </Link>
          </div>
          <div className="max-w-sm">
            <div className="text-5xl mb-6">“</div>
            <p className="text-2xl font-display font-bold text-white leading-snug">
              Minglab mijozlar BronUz orqali joylarni bron qilmoqda
            </p>
            <p className="text-sm text-white/70 mt-4">
              Sardor T., Kafe egasi, Toshkent
            </p>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, text: t('home.featureSecureDesc', 'Barcha to\'lovlar xavfsiz va himoyalangan') },
              { icon: <Zap className="w-5 h-5" />, text: t('home.featureFastDesc', 'Bir necha soniyada joy bron qiling') },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                  {item.icon}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-8">
            <Link href="/" className="font-display text-2xl font-bold text-brand">BronUz</Link>
            <h1 className="text-2xl font-display font-bold text-ink mt-4">{t('auth.loginTitle', 'Xush kelibsiz')}</h1>
            <p className="text-sm text-ink-tertiary mt-1">{t('auth.loginSubtitle', 'Hisobingizga kiring')}</p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <h1 className="text-3xl font-display font-bold text-ink">{t('auth.loginTitle', 'Xush kelibsiz')}</h1>
            <p className="text-base text-ink-tertiary mt-1">{t('auth.loginSubtitle', 'Hisobingizga kiring')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.email', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="siz@example.com"
                  {...register('email')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border-2 rounded-xl text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.email
                      ? 'border-error shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.password', 'Parol')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-[52px] pl-11 pr-11 bg-white border-2 rounded-xl text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.password
                      ? 'border-error shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1">{errors.password.message}</p>
              )}
              <div className="flex justify-end mt-2">
                <button type="button" className="text-xs text-brand hover:underline">
                  {t('auth.forgotPassword', 'Parolni unutdingizmi?')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl shadow-button transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('common.login', 'Kirish')
              )}
            </button>

            {errors.root && (
              <p className="text-sm text-error text-center flex items-center justify-center gap-1">
                <span>⚠️</span> {errors.root.message}
              </p>
            )}
          </form>

          <p className="text-sm text-ink-tertiary text-center mt-8">
            {t('auth.noAccount', 'Hisobingiz yo\'qmi?')}{' '}
            <Link href="/register" className="text-brand font-medium hover:underline">
              {t('auth.registerLink', 'Ro\'yxatdan o\'ting')}
            </Link>
          </p>

          <div className="mt-4 p-4 rounded-2xl bg-info-bg border border-info/20">
            <p className="text-xs text-center text-info">
              Test: admin@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
