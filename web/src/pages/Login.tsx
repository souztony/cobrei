import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WalletCards, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  async function onSubmit(data: FormData) {
    setError('')
    try {
      if (isRegister) {
        if (!data.name) {
          setError('Nome é obrigatório para cadastro')
          return
        }
        await api.post('/users', {
          name: data.name,
          email: data.email,
          password: data.password
        })
        // Após cadastrar, faz login
      }

      const response = await api.post('/sessions', {
        email: data.email,
        password: data.password
      })

      signIn(response.data.token, response.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro, tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4 transform -rotate-6">
            <WalletCards className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Cobrei</h1>
          <p className="text-slate-500 mt-2 text-center">cobre sem complicação.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                {...register('name')}
                type="text"
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="ml-2 text-blue-600 font-semibold hover:underline focus:outline-none"
            >
              {isRegister ? 'Fazer login' : 'Cadastre-se'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
