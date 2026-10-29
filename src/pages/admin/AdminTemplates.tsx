import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type TemplateAdmin } from '@/lib/admin-api'

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<TemplateAdmin[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    adminApi.templates()
      .then(setTemplates)
      .catch(err => {
        if (err instanceof Error && err.message.includes('No autorizado')) navigate('/admin/login')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [navigate])

  const startEdit = (t: TemplateAdmin) => {
    setEditing(t.id)
    setEditData({ name: t.name, description: t.description, price_mxn: t.price_mxn, active: t.active })
  }

  const save = async (id: string) => {
    setSaving(true)
    try {
      await adminApi.updateTemplate(id, editData)
      setEditing(null)
      load()
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-slate-400">Cargando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plantillas</h1>
      <div className="space-y-4">
        {templates.map(t => (
          <div key={t.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            {editing === t.id ? (
              <div className="space-y-3">
                <input
                  value={editData['name'] as string}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-1 text-sm"
                />
                <textarea
                  value={editData['description'] as string}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-1 text-sm"
                  rows={2}
                />
                <div className="flex gap-3 items-center">
                  <label className="text-sm text-slate-400">Precio (centavos):</label>
                  <input
                    type="number"
                    value={editData['price_mxn'] as number}
                    onChange={e => setEditData({ ...editData, price_mxn: parseInt(e.target.value, 10) || 0 })}
                    className="w-32 bg-slate-800 text-white border border-slate-700 rounded px-3 py-1 text-sm"
                  />
                  <label className="text-sm text-slate-400 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={(editData['active'] as number) === 1}
                      onChange={e => setEditData({ ...editData, active: e.target.checked ? 1 : 0 })}
                    />
                    Activa
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => save(t.id)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setEditing(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold">{t.name} <span className="text-xs text-slate-500">({t.slug})</span></h2>
                  <p className="text-sm text-slate-400">{t.description}</p>
                  <p className="text-sm mt-1">
                    ${(t.price_mxn / 100).toFixed(2)} MXN
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
                </div>
                <button onClick={() => startEdit(t)} className="text-purple-400 hover:underline text-sm">Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
