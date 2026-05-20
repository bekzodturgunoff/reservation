import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, CalendarDaysIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <CalendarDaysIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.registerTitle')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('auth.registerSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.accountType')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'user')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedRole === 'user'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  {t('auth.user')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'business')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedRole === 'business'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-emerald-600 font-medium hover:underline">
                {t('auth.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
