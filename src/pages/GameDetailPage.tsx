import { Link, useParams } from 'react-router-dom'
import { GAME_TEMPLATES, formatPriceMXN } from '@/lib/constants'

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const game = GAME_TEMPLATES.find((g) => g.slug === slug)

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Juego no encontrado</h1>
        <p className="text-purple-300 mb-6">El juego que buscas no existe o fue retirado.</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image */}
        <div className="aspect-video bg-gradient-to-br from-purple-900/40 to-pink-900/30 rounded-2xl flex items-center justify-center p-8">
          <img src={game.image} alt={game.name} className="w-full h-full object-contain drop-shadow-lg" />
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{game.name}</h1>
          <p className="text-purple-200 mb-6 leading-relaxed">{game.description}</p>
          <p className="text-3xl font-bold text-purple-400 mb-6">{formatPriceMXN(game.priceMxn)}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/personalizar/${game.slug}`}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl text-center transition-colors"
            >
              Personalizar y comprar
            </Link>
            <Link
              to={`/demo/${game.slug}`}
              className="border border-purple-600 text-purple-300 hover:bg-purple-900/30 font-semibold px-6 py-3 rounded-xl text-center transition-colors"
            >
              Probar demo
            </Link>
          </div>
        </div>
      </div>

      {/* Game features */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🎮</div>
          <h3 className="text-white font-semibold mb-1">Juega en cualquier dispositivo</h3>
          <p className="text-purple-300 text-sm">Funciona en celular y computadora sin instalar nada.</p>
        </div>
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">✏️</div>
          <h3 className="text-white font-semibold mb-1">Totalmente personalizable</h3>
          <p className="text-purple-300 text-sm">Nombres, dedicatoria, colores y temática a tu gusto.</p>
        </div>
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🔗</div>
          <h3 className="text-white font-semibold mb-1">Comparte con un enlace</h3>
          <p className="text-purple-300 text-sm">Envía el regalo por WhatsApp, redes sociales o email.</p>
        </div>
      </div>
    </div>
  )
}
