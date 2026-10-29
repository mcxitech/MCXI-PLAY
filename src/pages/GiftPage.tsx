import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import type { GameConfig } from '@/game/config'
import { SITE_NAME } from '@/lib/constants'

// Recipient page: only needs the public slug. Never shows buyer data or the management token.
export default function GiftPage() {
  const { publicSlug } = useParams<{ publicSlug: string }>()
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [playing, setPlaying] = useState(false)
  const engineLoaded = useRef(false)

  useEffect(() => {
    if (!publicSlug) return
    api.gift(publicSlug).then((g) => setConfig(g.config)).catch(() => setNotFound(true))
  }, [publicSlug])

  // The full game is not in the public bundle: the Worker serves it with this gift's
  // config embedded, only while the order is activated and the link is active (D020).
  // It renders into #game.
  useEffect(() => {
    if (!playing || !publicSlug || engineLoaded.current) return
    engineLoaded.current = true
    const script = document.createElement('script')
    script.src = `/api/gifts/${encodeURIComponent(publicSlug)}/engine.js`
    script.onerror = () => setNotFound(true)
    document.body.appendChild(script)
  }, [playing, publicSlug])

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Este regalo no está disponible</h1>
          <p className="text-purple-300 text-sm mb-6">El enlace no existe o fue desactivado. Pide a quien te lo envió que lo revise.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 underline text-sm">Conoce {SITE_NAME}</Link>
        </div>
      </div>
    )
  }

  if (!config) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-300">Abriendo tu regalo...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-6">
      {!playing ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
          <div className="text-6xl mb-6" aria-hidden>🎁</div>
          <p className="text-purple-300 mb-2">Hola, {config.recipientName}</p>
          <h1 className="text-3xl font-bold text-white mb-4">
            {config.senderName} te envió un regalo
          </h1>
          <p className="text-purple-300 text-sm mb-8">Es un pequeño juego hecho para ti. Complétalo para descubrir su mensaje.</p>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="font-bold text-white text-lg px-10 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
          >
            Jugar
          </button>
        </div>
      ) : (
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-full max-w-[400px] h-[calc(100vh-5rem)] max-h-[600px] aspect-[2/3]">
            <div id="game" className="w-full h-full rounded-xl overflow-hidden" />
          </div>
        </div>
      )}
      <p className="text-xs text-purple-700 mt-4">Hecho con {SITE_NAME}</p>
    </div>
  )
}
