import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EnvelopeIcon, LockClosedIcon, CalendarDaysIcon, ShieldCheckIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Login = () => {
  const { t } = useTranslation()
  useTitle(t('common.login'))
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const schema = useMemo(() => z.object({
    email: z.string().email(t('auth.validEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
  }), [t])

  type FormData = z.infer<typeof schema>

  interface LocationState { from?: { pathname?: string } }
  const from = (location.state as LocationState)?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      addToast({ type: 'error', message: error.message })
      setLoading(false)
      return
    }

    addToast({ type: 'success', message: t('auth.welcome') })
    navigate(from, { replace: true })
  }

  return (
    <div className="-mx-6 flex min-h-[calc(100vh-64px)]">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: '#0A0A0A' }}>
        <div className="max-w-sm">
          <div className="mb-8">
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '28px', fontWeight: 700, color: '#00A86B', letterSpacing: '-0.03em' }}>Bron</span>
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '28px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>Uz</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-sm mb-10" style={{ color: '#6B6B6B' }}>
            {t('auth.loginSubtitle')}
          </p>
          <div className="space-y-6">
            {[
              { icon: <ShieldCheckIcon className="w-5 h-5" />, text: t('home.featureSecureDesc') },
              { icon: <BoltIcon className="w-5 h-5" />, text: t('home.featureFastDesc') },
              { icon: <StarIcon className="w-5 h-5" />, text: t('home.featureVerifiedDesc') },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: '#00A86B' }}>
                  {item.icon}
                </div>
                <p className="text-sm" style={{ color: '#A8A8A8' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden mt-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-brand)' }}>
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('auth.loginTitle')}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{t('auth.loginSubtitle')}</p>
          </div>

          <div className="p-5 sm:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label={t('common.email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                leftIcon={<EnvelopeIcon className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('common.password')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                leftIcon={<LockClosedIcon className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(r => !r)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: 'var(--color-brand)' }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('auth.rememberMe')}</span>
              </label>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                {t('common.login')}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
                  {t('auth.registerLink')}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--color-info-light)', border: '1px solid var(--color-info-light)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--color-info)' }}>
              {t('auth.testHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
