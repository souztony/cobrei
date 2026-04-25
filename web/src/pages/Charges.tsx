import { useEffect, useState } from 'react'
import { Plus, Loader2, MessageCircle, CheckCircle2, Clock } from 'lucide-react'
import { api } from '../services/api'

interface Client {
  id: string
  name: string
  phone: string
}

interface Charge {
  id: string
  amount: number
  description: string
  dueDate: string
  status: 'PENDING' | 'PAID'
  client: Client
}

export function Charges() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [clientId, setClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [chargesRes, clientsRes] = await Promise.all([
        api.get('/charges'),
        api.get('/clients')
      ])
      setCharges(chargesRes.data)
      setClients(clientsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/charges', {
        clientId,
        amount: Number(amount),
        description,
        dueDate
      })
      setIsModalOpen(false)
      setClientId('')
      setAmount('')
      setDescription('')
      setDueDate('')
      loadData()
    } catch (err) {
      alert('Erro ao criar cobrança')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID'
      await api.patch(`/charges/${id}/status`, { status: newStatus })
      setCharges(charges.map(c => c.id === id ? { ...c, status: newStatus } : c))
    } catch (err) {
      alert('Erro ao atualizar status')
    }
  }

  function handleSendWhatsapp(charge: Charge) {
    const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(charge.amount)
    const formattedDate = new Date(charge.dueDate).toLocaleDateString('pt-BR')
    const text = `Olá ${charge.client.name}, tudo bem? Estou passando para lembrar da cobrança referente a "${charge.description}" no valor de ${formattedAmount} com vencimento para ${formattedDate}.`
    
    // Remove tudo que não for número do telefone
    const phone = charge.client.phone.replace(/\D/g, '')
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cobranças</h1>
          <p className="text-slate-500 mt-1">Controle de quem deve e quem já pagou.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-5 h-5" />
          Nova Cobrança
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Descrição</th>
              <th className="px-6 py-4 font-semibold">Valor</th>
              <th className="px-6 py-4 font-semibold">Vencimento</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {charges.map(charge => (
              <tr key={charge.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{charge.client.name}</td>
                <td className="px-6 py-4 text-slate-600">{charge.description}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(charge.amount)}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(charge.id, charge.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      charge.status === 'PAID' 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {charge.status === 'PAID' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {charge.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                  </button>
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button 
                    onClick={() => handleSendWhatsapp(charge)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-colors border border-green-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Cobrar
                  </button>
                </td>
              </tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Nenhuma cobrança registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Nova Cobrança</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select
                  required
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Corte de cabelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                <input
                  required
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 flex justify-center"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
