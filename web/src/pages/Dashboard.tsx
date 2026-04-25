import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react'
import { api } from '../services/api'

interface DashboardData {
  totalReceived: number
  totalPending: number
  totalOverdue: number
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get('/dashboard')
        setData(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Resumo Financeiro</h1>
        <p className="text-slate-500 mt-1">Acompanhe seus recebimentos e valores pendentes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ArrowUpRight className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Recebido</h2>
          </div>
          <p className="text-4xl font-bold text-slate-900">{formatCurrency(data?.totalReceived || 0)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Clock className="w-16 h-16 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">A Receber</h2>
          </div>
          <p className="text-4xl font-bold text-slate-900">{formatCurrency(data?.totalPending || 0)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ArrowDownRight className="w-16 h-16 text-red-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Atrasado</h2>
          </div>
          <p className="text-4xl font-bold text-red-600">{formatCurrency(data?.totalOverdue || 0)}</p>
        </div>
      </div>
    </div>
  )
}
