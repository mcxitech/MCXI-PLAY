import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi, type OrderAdmin } from '@/lib/admin-api'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-blue-500/20 text-blue-400',
  activated: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  activated: 'Activado',
  cancelled: 'Cancelado',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderAdmin[]>([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    adminApi.orders(filter || undefined, search || undefined)
      .then(setOrders)
      .catch(err => {
        if (err instanceof Error && err.message.includes('No autorizado')) navigate('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [filter, search, navigate])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        {['', 'pending', 'paid', 'activated', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {s ? STATUS_LABELS[s] : 'Todos'}
          </button>
        ))}
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500">Sin pedidos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Número</th>
                <th className="pb-2">Comprador</th>
                <th className="pb-2">Precio</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="py-2">
                    <Link to={`/admin/pedidos/${o.id}`} className="text-purple-400 hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="py-2">{o.buyer_name}</td>
                  <td className="py-2">${(o.price_mxn / 100).toFixed(2)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[o.status] ?? ''}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">{new Date(o.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
