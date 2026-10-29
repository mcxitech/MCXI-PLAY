import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type GiftManage } from '@/lib/api'
import CopyButton from '@/components/CopyButton'
import { downloadGiftZip } from '@/lib/exportGift'

// Buyer page: reachable only with the private token. Shows the shareable recipient link.
export default function BuyerManagePage() {
  const { buyerToken } = useParams<{ buyerToken: string }>()
  const [gift, setGift] = useState<GiftManage | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    if (!buyerToken) return
    api.manage(buyerToken).then(setGift).catch(() => setNotFound(true))
  }, [buyerToken])

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Enlace no válido</h1>
        <p className="text-purple-300 text-sm mb-6">
          Este enlace de gestión no existe o fue reemplazado. Si necesitas uno nuevo, contáctanos con tu número de pedido.
        </p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 underline">Volver al inicio</Link>
      </div>
    )
  }

  if (!gift) return <p className="text-center text-purple-300 py-20">Cargando...</p>

  const giftUrl = `${window.location.origin}/regalo/${gift.publicSlug}`
  const shareText = `${gift.config.recipientName}, te hice un regalo especial 🎁 ${giftUrl}`

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tu regalo está listo</h1>
        <p className="text-purple-300 text-sm">
          Esta página es privada. No compartas este enlace; comparte solo el enlace del regalo.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Enlace para {gift.config.recipientName}</h2>
        {gift.active ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={giftUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 bg-slate-900 border border-purple-900/50 rounded-lg px-3 py-2 text-white text-sm font-mono"
              />
              <CopyButton text={giftUrl} label="Copiar enlace" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Enviar por WhatsApp
              </a>
              <a
                href={`/regalo/${gift.publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center border border-purple-600 text-purple-300 hover:bg-purple-900/30 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Probar el regalo
              </a>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-300">El enlace del regalo está desactivado. Contáctanos si necesitas reactivarlo.</p>
        )}
      </div>

      {gift.active && (
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6 space-y-3">
          <h2 className="text-white font-semibold">Copia descargable</h2>
          <p className="text-sm text-purple-300">
            Descarga un ZIP con tu regalo para conservarlo o publicarlo por tu cuenta. Funciona sin internet;
            las instrucciones vienen dentro (LEEME.txt).
          </p>
          {exportError && <p className="text-sm text-red-400">{exportError}</p>}
          <button
            type="button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true)
              setExportError('')
              try {
                await downloadGiftZip(gift.config, gift.orderNumber)
              } catch (err) {
                setExportError(err instanceof Error ? err.message : 'No se pudo generar el ZIP')
              } finally {
                setExporting(false)
              }
            }}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {exporting ? 'Preparando ZIP...' : 'Descargar ZIP'}
          </button>
        </div>
      )}

      <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6">
        <dl className="space-y-2 text-sm">
          <Row label="Juego" value={gift.gameName} />
          <Row label="Pedido" value={gift.orderNumber} />
          <Row label="De" value={gift.config.senderName} />
          <Row label="Dedicatoria" value={`"${gift.config.dedication}"`} />
          <Row label="Veces abierto" value={String(gift.playCount)} />
        </dl>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-purple-400 shrink-0">{label}</dt>
      <dd className="text-white text-right break-words min-w-0">{value}</dd>
    </div>
  )
}
