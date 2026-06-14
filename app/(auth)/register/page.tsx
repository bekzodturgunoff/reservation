'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTitle } from '@/hooks/useTitle'

const RegisterPage = () => {
  const { t } = useTranslation()
  useTitle("Ro'yxatdan o'tish — BronUz")
  const router = useRouter()
  const { setUser, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'user' | 'business'>('user')

  const schema = useMemo(() => z.object({
    full_name: z.string().min(2, t('auth.nameMin', 'Ism kamida 2 belgidan iborat')),
    phone: z.string().min(9, t('auth.phoneInvalid', 'Noto\'g\'ri telefon raqam')),
    email: z.string().email(t('auth.validEmail', 'Noto\'g\'ri email')),
    password: z.string().min(6, t('auth.passwordMin', 'Parol kamida 6 belgidan iborat')),
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
      { level: 1, color: 'bg-error', label: 'Juda zaif' },
      { level: 2, color: 'bg-orange-500', label: 'Zaif' },
      { level: 3, color: 'bg-yellow-500', label: "O'rtacha" },
      { level: 4, color: 'bg-lime-500', label: 'Yaxshi' },
      { level: 5, color: 'bg-success', label: 'Kuchli' },
    ]
    return levels[points] || levels[0]
  }

  const strength = getPasswordStrength(password)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
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
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      setUser(authData.user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      setProfile(profile)
      toast.success(t('auth.registered', "Muvaffaqiyatli ro'yxatdan o'tdingiz!"))
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
          <div className="max-w-sm space-y-6">
            <h2 className="text-2xl font-display font-bold text-white">Ro'yxatdan o'ting</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              BronUz orqali O'zbekistondagi eng yaxshi joylarni kashf eting va bir zumda bron qiling.
            </p>
            <div className="space-y-4 pt-2">
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, text: 'Barcha to\'lovlar xavfsiz' },
                { icon: <Zap className="w-5 h-5" />, text: 'Tez va qulay bron qilish' },
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
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-12">
        <div className="w-full max-w-[420px]">
          <div className="text-center lg:hidden mb-8">
            <Link href="/" className="font-display text-2xl font-bold text-brand">BronUz</Link>
            <h1 className="text-2xl font-display font-bold text-ink mt-4">{t('auth.register', "Ro'yxatdan o'tish")}</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-display font-bold text-ink">{t('auth.register', "Ro'yxatdan o'tish")}</h1>
            <p className="text-base text-ink-tertiary mt-1">Hisob yarating va bron qilishni boshlang</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setRole('user')}
              className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                role === 'user'
                  ? 'border-brand bg-brand-pale'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <span className="text-xl">👤</span>
              <p className="text-sm font-semibold text-ink mt-1">Foydalanuvchi</p>
              <p className="text-xs text-ink-tertiary">Joy bron qilish uchun</p>
              {role === 'user' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
            <button
              onClick={() => setRole('business')}
              className={`flex-1 p-4 rounded-xl border-2 text-left relative transition-all ${
                role === 'business'
                  ? 'border-brand bg-brand-pale'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <span className="text-xl">🏢</span>
              <p className="text-sm font-semibold text-ink mt-1">Biznes egasi</p>
              <p className="text-xs text-ink-tertiary">Joy qo'shish uchun</p>
              {role === 'business' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.fullName', "To'liq ism")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Sardor Toshmatov"
                  {...register('full_name')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border-2 rounded-xl text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.full_name
                      ? 'border-error shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.full_name && <p className="text-xs text-error mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.phone', 'Telefon')}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  {...register('phone')}
                  className={`w-full h-[52px] pl-11 pr-4 bg-white border-2 rounded-xl text-base text-ink placeholder:text-ink-muted outline-none transition-all ${
                    errors.phone
                      ? 'border-error shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)]'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.email', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-email"
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
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-1.5 block">
                {t('common.password', 'Parol')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="reg-password"
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
              {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}

              {/* Password Strength */}
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
                  <p className={`text-[11px] mt-1 ${strength.level > 0 ? 'text-ink-tertiary' : ''}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl shadow-button transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('auth.register', "Ro'yxatdan o'tish")
              )}
            </button>
          </form>

          <p className="text-sm text-ink-tertiary text-center mt-6">
            {t('auth.hasAccount', 'Hisobingiz bormi?')}{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">
              {t('common.login', 'Kirish')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
