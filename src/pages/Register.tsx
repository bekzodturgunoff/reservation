import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, CalendarDaysIcon, BriefcaseIcon, ShieldCheckIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Register = () => {
  const { t } = useTranslation()
  useTitle(t('common.register'))
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)

  const schema = useMemo(() => z.object({
    full_name: z.string().min(2, t('auth.nameMin')),
    phone: z.string().min(9, t('profile.phoneRequired')).regex(/^\+?[0-9]+$/, t('auth.phoneDigitsOnly')),
    email: z.string().email(t('auth.validEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
    confirm_password: z.string(),
    role: z.enum(['user', 'business']),
  }).refine(d => d.password === d.confirm_password, {
    message: t('auth.passwordsNoMatch'),
    path: ['confirm_password'],
  }), [t])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        },
      },
    })

    if (error) {
      addToast({ type: 'error', message: error.message })
      setLoading(false)
      return
    }

    addToast({
      type: 'success',
      message: t('auth.registerSuccess'),
    })
    navigate('/login')
  }

  const activeRoleStyle = {
    borderColor: 'var(--color-brand)',
    background: 'var(--color-brand-light)',
    color: 'var(--color-brand)',
  }

  const inactiveRoleStyle = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-secondary)',
  }

  return (
    <div className="-mx-4 sm:-mx-6 flex min-h-[calc(100vh-64px)]">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: '#0A0A0A' }}>
        <div className="max-w-sm">
          <div className="mb-8">
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '28px', fontWeight: 700, color: '#00A86B', letterSpacing: '-0.03em' }}>Bron</span>
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '28px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>Uz</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {t('auth.registerTitle')}
          </h2>
          <p className="text-sm mb-10" style={{ color: '#6B6B6B' }}>
            {t('auth.registerSubtitle')}
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

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-12 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-6 lg:hidden mt-2 sm:mt-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-brand)' }}>
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{t('auth.registerTitle')}</h1>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{t('auth.registerSubtitle')}</p>
          </div>

          <div className="p-5 sm:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('auth.accountType')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'user')}
                    className="flex items-center justify-center gap-2 min-h-[48px] p-3 rounded-xl border-2 text-sm font-medium transition-all"
                    style={selectedRole === 'user' ? activeRoleStyle : inactiveRoleStyle}
                  >
                    <UserIcon className="w-4 h-4" />
                    {t('auth.user')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'business')}
                    className="flex items-center justify-center gap-2 min-h-[48px] p-3 rounded-xl border-2 text-sm font-medium transition-all"
                    style={selectedRole === 'business' ? activeRoleStyle : inactiveRoleStyle}
                  >
                    <BriefcaseIcon className="w-4 h-4" />
                    {t('auth.business')}
                  </button>
                </div>
              </div>

              <Input
                label={t('common.fullName')}
                placeholder={t('auth.namePlaceholder')}
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label={t('common.phone')}
                placeholder={t('auth.phonePlaceholder')}
                leftIcon={<PhoneIcon className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
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
              <Input
                label={t('common.confirmPassword')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                leftIcon={<LockClosedIcon className="w-4 h-4" />}
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                {t('common.register')}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
                  {t('auth.loginLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
