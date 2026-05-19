import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, CalendarDays, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store/toastStore'
import { useTitle } from '../hooks/useTitle'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const schema = z.object({
  full_name: z.string().min(2, 'Ism kamida 2 ta belgi'),
  phone: z.string().min(9, 'Telefon raqam kiriting').regex(/^\+?[0-9]+$/, 'Faqat raqamlar'),
  email: z.string().email('Yaroqli email kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
  confirm_password: z.string(),
  role: z.enum(['user', 'business']),
}).refine(d => d.password === d.confirm_password, {
  message: 'Parollar mos emas',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

const Register = () => {
  useTitle("Ro'yxatdan o'tish")
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)

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
      message: "Ro'yxatdan o'tdingiz! Emailingizni tasdiqlang.",
    })
    navigate('/login')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hisob yarating</h1>
          <p className="text-gray-500 mt-1 text-sm">BronUz ga qo'shiling</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hisob turi
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
                  <User className="w-4 h-4" />
                  Foydalanuvchi
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
                  <Briefcase className="w-4 h-4" />
                  Biznes
                </button>
              </div>
            </div>

            <Input
              label="To'liq ism"
              placeholder="Abdullayev Jasur"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Telefon raqam"
              placeholder="+998901234567"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
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
            <Input
              label="Parolni tasdiqlang"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Ro'yxatdan o'tish
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="text-emerald-600 font-medium hover:underline">
                Kiring
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
