import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EnvelopeIcon, LockClosedIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <CalendarDaysIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.loginTitle')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('auth.loginSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
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
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
            </label>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {t('common.login')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                {t('auth.registerLink')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            {t('auth.testHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
