import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AuditEntry } from '@/lib/admin-api'

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    adminApi.audit()
      .then(setLogs)
      .catch(err => {
        if (err instanceof Error && err.message.includes('No autorizado')) navigate('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <p className="text-slate-400">Cargando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Registro de Auditoría</h1>
      {logs.length === 0 ? (
        <p className="text-slate-500">Sin registros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Acción</th>
                <th className="pb-2">Entidad</th>
                <th className="pb-2">Realizado por</th>
                <th className="pb-2">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-slate-800/50">
                  <td className="py-2 text-slate-400">{new Date(l.created_at).toLocaleString('es-MX')}</td>
                  <td className="py-2">{l.action}</td>
                  <td className="py-2">{l.entity_type}/{l.entity_id.slice(0, 8)}</td>
                  <td className="py-2">{l.performed_by}</td>
                  <td className="py-2 text-xs text-slate-500 max-w-xs truncate">{l.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
