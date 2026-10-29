import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '@/lib/admin-api'

const NAV = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/plantillas', label: 'Plantillas' },
  { to: '/admin/auditoria', label: 'Auditoría' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try { await adminApi.logout() } catch { /* ignore */ }
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-lg font-bold text-purple-400">MCXI Admin</Link>
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm ${location.pathname === n.to ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400">
          Cerrar sesión
        </button>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
