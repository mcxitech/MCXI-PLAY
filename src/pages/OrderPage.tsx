import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type OrderStatus, type OrderState } from '@/lib/api'
import { PAYMENT_INFO, formatPriceMXN } from '@/lib/constants'
import CopyButton from '@/components/CopyButton'

const STATUS_TEXT: Record<OrderState, { label: string; className: string; message: string }> = {
  pending: {
    label: 'Pendiente de pago',
    className: 'bg-yellow-500/20 text-yellow-300',
    message: 'Realiza tu pago con los datos de abajo y envíanos tu comprobante indicando tu número de pedido.',
  },
  paid: {
    label: 'Pago confirmado',
    className: 'bg-blue-500/20 text-blue-300',
    message: 'Recibimos tu pago. Estamos preparando tu regalo; te enviaremos los enlaces por el medio de contacto que nos diste.',
  },
  activated: {
    label: 'Regalo activado',
    className: 'bg-green-500/20 text-green-300',
    message: 'Tu regalo está listo. Te enviamos por mensaje privado el enlace para compartir y tu enlace de gestión.',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500/20 text-red-300',
    message: 'Este pedido fue cancelado. Si crees que es un error, contáctanos.',
  },
}

export default function OrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderNumber) return
    api.order(orderNumber).then(setOrder).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Error')
    })
  }, [orderNumber])

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Pedido no encontrado</h1>
        <p className="text-purple-300 mb-6 text-sm">Revisa que el número de pedido esté escrito correctamente.</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 underline">Volver al inicio</Link>
      </div>
    )
  }

  if (!order) return <p className="text-center text-purple-300 py-20">Cargando pedido...</p>

  const status = STATUS_TEXT[order.status] ?? STATUS_TEXT.pending

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tu pedido</h1>
        <p className="text-purple-300 text-sm">Guarda este número: lo necesitarás para cualquier aclaración.</p>
      </div>

      <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xl font-mono font-bold text-white break-all">{order.orderNumber}</span>
          <CopyButton text={order.orderNumber} label="Copiar número" />
        </div>
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${status.className}`}>{status.label}</span>
        <p className="text-sm text-purple-200">{status.message}</p>
        <dl className="border-t border-purple-900/30 pt-4 space-y-2 text-sm">
          <Row label="Juego" value={order.gameName} />
          <Row label="Total" value={formatPriceMXN(order.priceMxn / 100)} />
          <Row label="Fecha" value={new Date(order.createdAt).toLocaleString('es-MX')} />
        </dl>
      </div>

      {order.status === 'pending' && (
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6 space-y-3">
          <h2 className="text-white font-semibold">Instrucciones de pago</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Banco" value={PAYMENT_INFO.bank} />
            <Row label="Titular" value={PAYMENT_INFO.holder} />
            <Row label="CLABE" value={PAYMENT_INFO.clabe} />
            <Row label="Monto" value={formatPriceMXN(order.priceMxn / 100)} />
            <Row label="Concepto" value={order.orderNumber} />
          </dl>
          <p className="text-sm text-purple-200 border-t border-purple-900/30 pt-3">
            Envía tu comprobante a <strong className="text-white">{PAYMENT_INFO.contact}</strong> con tu número de pedido.
            Verificamos los pagos manualmente; tu regalo se activa cuando confirmemos el depósito.
          </p>
        </div>
      )}

      <p className="text-center">
        <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm underline">Volver al inicio</Link>
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-purple-400 shrink-0">{label}</dt>
      <dd className="text-white text-right break-all">{value}</dd>
    </div>
  )
}
