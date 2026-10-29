import { Link, useParams } from 'react-router-dom'
import PhaserGame from '@/components/PhaserGame'
import { GAME_TEMPLATES } from '@/lib/constants'
import { DEFAULT_CONFIG } from '@/game/config'

export default function DemoPage() {
  const { slug } = useParams<{ slug: string }>()
  const game = GAME_TEMPLATES.find((g) => g.slug === slug)

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Juego no encontrado</h1>
        <Link to="/" className="text-purple-400 hover:text-purple-300 underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <Link to={`/juego/${game.slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
        ← Volver a {game.name}
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        {/* Game — left side, fits viewport height */}
        <div className="w-full lg:w-auto lg:shrink-0 lg:h-[calc(100vh-10rem)] lg:aspect-[2/3]">
          <PhaserGame config={DEFAULT_CONFIG} className="w-full h-full max-w-[400px] mx-auto lg:mx-0" />
        </div>

        {/* Info — right side */}
        <div className="flex-1 min-w-0 lg:py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {game.name}
          </h1>
          <p className="text-purple-300 mb-6 text-sm">
            Esta es una demostración con datos genéricos. ¡Personalízalo para hacerlo único!
          </p>

          {/* How to play */}
          <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-4">¿Cómo jugar?</h2>
            <div className="space-y-4">
              <HowToItem
                icon={
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <rect x="10" y="2" width="20" height="14" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
                    <polygon points="20,6 16,13 24,13" fill="#c084fc" />
                    <rect x="2" y="20" width="14" height="14" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
                    <polygon points="6,27 13,23 13,31" fill="#c084fc" />
                    <rect x="24" y="20" width="14" height="14" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
                    <polygon points="34,27 27,23 27,31" fill="#c084fc" />
                  </svg>
                }
                title="Mueve al personaje"
                description="Usa las flechas del teclado. En móvil, toca y arrastra."
              />
              <HowToItem
                icon={
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <circle cx="14" cy="16" r="8" fill="none" stroke="#f472b6" strokeWidth="2" />
                    <circle cx="26" cy="16" r="8" fill="none" stroke="#f472b6" strokeWidth="2" />
                    <polygon points="12,18 20,32 28,18" fill="#f472b6" opacity="0.6" />
                    <text x="20" y="38" textAnchor="middle" fill="#f0abfc" fontSize="8" fontFamily="system-ui">×10</text>
                  </svg>
                }
                title="Recoge 10 corazones"
                description="Toca todos los corazones flotantes para desbloquear la dedicatoria."
              />
              <HowToItem
                icon={
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <polygon points="20,4 24,15 36,15 27,22 30,34 20,27 10,34 13,22 4,15 16,15" fill="none" stroke="#a78bfa" strokeWidth="2" />
                    <rect x="6" y="6" width="10" height="10" rx="1" fill="none" stroke="#a78bfa" strokeWidth="2" transform="rotate(45 11 11)" />
                  </svg>
                }
                title="Esquiva los obstáculos"
                description="Las estrellas y cuadrados se mueven por la pantalla. ¡No los toques!"
              />
              <HowToItem
                icon={
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="#c084fc" strokeWidth="2" />
                    <text x="20" y="24" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="system-ui">P</text>
                  </svg>
                }
                title="Pausa y sonido"
                description="Presiona P o toca ⏸ para pausar. Presiona M para silenciar."
              />
            </div>
          </div>

          <Link
            to={`/personalizar/${game.slug}`}
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Personalizar y comprar
          </Link>
        </div>
      </div>
    </div>
  )
}

function HowToItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-purple-400 text-xs">{description}</p>
      </div>
    </div>
  )
}
