import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const schema = z.object({
  email: z.string().email('Yaroqli email kiriting'),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
})

type FormData = z.infer<typeof schema>

const Login = () => {
  useTitle('Kirish')
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/'

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

    addToast({ type: 'success', message: "Xush kelibsiz!" })
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BronUz ga xush kelibsiz</h1>
          <p className="text-gray-500 mt-1 text-sm">Hisobingizga kiring</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Parol"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Kirish
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hisobingiz yo'qmi?{' '}
              <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            💡 Test uchun: avval ro'yxatdan o'ting, keyin kiring
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
