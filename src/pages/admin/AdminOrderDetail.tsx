import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi, type OrderDetail } from '@/lib/admin-api'
import CopyButton from '@/components/CopyButton'
import { downloadGiftZip, engineUrl } from '@/lib/exportGift'

const SMALL_BTN = 'bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs shrink-0'

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [paymentNote, setPaymentNote] = useState('')
  const navigate = useNavigate()

  const load = () => {
    if (!id) return
    adminApi.order(id)
      .then(setOrder)
      .catch(err => {
        if (err instanceof Error && err.message.includes('No autorizado')) navigate('/admin/login')
        else setError(err instanceof Error ? err.message : 'Error')
      })
  }

  useEffect(load, [id, navigate])

  const doAction = async (action: 'pay' | 'activate' | 'cancel' | 'rotate' | 'disable' | 'enable') => {
    if (!id) return
    if (action === 'rotate' && !confirm('El enlace de gestión actual dejará de funcionar. ¿Continuar?')) return
    if (action === 'disable' && !confirm('El destinatario ya no podrá abrir el regalo. ¿Continuar?')) return
    setActionLoading(true)
    try {
      if (action === 'pay') await adminApi.pay(id, paymentNote || undefined)
      else if (action === 'activate') await adminApi.activate(id)
      else if (action === 'cancel') await adminApi.cancel(id)
      else if (action === 'rotate') await adminApi.rotateToken(id)
      else await adminApi.setGiftAccess(id, action === 'enable')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  if (error) return <p className="text-red-400">{error}</p>
  if (!order) return <p className="text-slate-400">Cargando...</p>

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/pedidos')} className="text-purple-400 hover:underline text-sm">&larr; Volver</button>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
        <h1 className="text-xl font-bold">{order.order_number}</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-slate-400">Estado:</span> <span className="font-medium">{order.status}</span></div>
          <div><span className="text-slate-400">Precio:</span> ${(order.price_mxn / 100).toFixed(2)} MXN</div>
          <div><span className="text-slate-400">Plantilla:</span> {order.templateName}</div>
          <div><span className="text-slate-400">Comprador:</span> {order.buyer?.name}</div>
          <div><span className="text-slate-400">Email:</span> {order.buyer?.email}</div>
          <div><span className="text-slate-400">Fecha:</span> {new Date(order.created_at).toLocaleString('es-MX')}</div>
          {order.payment_date && <div><span className="text-slate-400">Pago:</span> {new Date(order.payment_date).toLocaleString('es-MX')}</div>}
          {order.payment_note && <div><span className="text-slate-400">Nota:</span> {order.payment_note}</div>}
        </div>

        <div>
          <h2 className="text-sm text-slate-400 mb-1">Personalización</h2>
          <pre className="bg-slate-800 rounded p-3 text-xs overflow-x-auto">{JSON.stringify(order.personalization, null, 2)}</pre>
        </div>

        {order.gift && (
          <div>
            <h2 className="text-sm text-slate-400 mb-1">Regalo</h2>
            <div className="text-sm space-y-3">
              <LinkRow
                label="Enlace del destinatario (para compartir)"
                url={`${window.location.origin}/regalo/${order.gift.publicSlug}`}
              />
              <LinkRow
                label="Enlace privado del comprador (enviar solo al comprador)"
                url={`${window.location.origin}/mi-regalo/${order.gift.buyerToken}`}
              />
              <p>Veces jugado: {order.gift.playCount}</p>
              <p>Enlace del destinatario activo: {order.gift.active ? 'Sí' : 'No'}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => doAction('rotate')} disabled={actionLoading} className={SMALL_BTN}>
                  Revocar y regenerar enlace del comprador
                </button>
                <button
                  onClick={async () => {
                    if (!order.gift) return
                    setActionLoading(true)
                    try {
                      await downloadGiftZip(engineUrl.admin(order.id), order.gift.config, order.order_number)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error al exportar')
                    } finally {
                      setActionLoading(false)
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs shrink-0"
                >
                  Descargar ZIP
                </button>
                {order.gift.active ? (
                  <button onClick={() => doAction('disable')} disabled={actionLoading} className={SMALL_BTN}>
                    Desactivar enlace del destinatario
                  </button>
                ) : (
                  <button onClick={() => doAction('enable')} disabled={actionLoading} className={SMALL_BTN}>
                    Reactivar enlace del destinatario
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-3">
        <h2 className="font-bold">Acciones</h2>

        {order.status === 'pending' && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-400">Nota de pago (opcional)</label>
              <input
                type="text"
                value={paymentNote}
                onChange={e => setPaymentNote(e.target.value)}
                className="block bg-slate-800 text-white border border-slate-700 rounded px-3 py-1 text-sm mt-1"
              />
            </div>
            <button
              onClick={() => doAction('pay')}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm"
            >
              Confirmar pago
            </button>
            <button
              onClick={() => doAction('cancel')}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {order.status === 'paid' && (
          <div className="flex gap-3">
            <button
              onClick={() => doAction('activate')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm"
            >
              Activar regalo
            </button>
            <button
              onClick={() => doAction('cancel')}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {(order.status === 'activated' || order.status === 'cancelled') && (
          <p className="text-slate-500 text-sm">No hay acciones disponibles para este estado.</p>
        )}
      </div>
    </div>
  )
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="text-purple-400 break-all text-xs flex-1 min-w-0">{url}</code>
        <CopyButton text={url} className={SMALL_BTN} />
      </div>
    </div>
  )
}
