import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type Stats } from '@/lib/admin-api'

function formatMXN(centavos: number) {
  return '$' + (centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(err => {
        if (err instanceof Error && err.message.includes('No autorizado')) navigate('/admin/login')
        else setError(err instanceof Error ? err.message : 'Error')
      })
  }, [navigate])

  if (error) return <p className="text-red-400">{error}</p>
  if (!stats) return <p className="text-slate-400">Cargando...</p>

  const cards = [
    { label: 'Pedidos totales', value: stats.totalOrders, color: 'text-white' },
    { label: 'Pendientes', value: stats.pending, color: 'text-yellow-400' },
    { label: 'Pagados', value: stats.paid, color: 'text-blue-400' },
    { label: 'Activados', value: stats.activated, color: 'text-green-400' },
    { label: 'Cancelados', value: stats.cancelled, color: 'text-red-400' },
    { label: 'Ingresos', value: formatMXN(stats.totalRevenue), color: 'text-emerald-400' },
    { label: 'Regalos creados', value: stats.totalGifts, color: 'text-purple-400' },
    { label: 'Veces jugado', value: stats.totalPlays, color: 'text-cyan-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
