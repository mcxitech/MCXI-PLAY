import { Link, useParams } from 'react-router-dom'
import { formatPriceMXN } from '@/lib/constants'
import { useTemplates } from '@/lib/useTemplates'

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { templates, loading } = useTemplates()
  const game = templates.find((g) => g.slug === slug)

  if (loading) return <p className="text-center text-purple-300 py-20">Cargando...</p>

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
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold px-6 py-3 rounded-full text-center transition-all"
            >
              Personalizar y comprar
            </Link>
            <Link
              to={`/demo/${game.slug}`}
              className="border border-purple-700 text-purple-200 hover:text-white hover:bg-purple-900/30 font-semibold px-6 py-3 rounded-full text-center transition-colors"
            >
              Probar demo gratis
            </Link>
          </div>
        </div>
      </div>

      {/* Game features */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-2xl p-6 text-center hover:border-purple-700/60 transition-colors">
          <span className="w-11 h-11 mx-auto rounded-xl bg-purple-900/30 border border-purple-900/40 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
            </svg>
          </span>
          <h3 className="text-white font-semibold mb-1">Directo en el navegador</h3>
          <p className="text-purple-300 text-sm leading-relaxed">Abre el enlace y juega. Sin descargas, sin apps, sin registros.</p>
        </div>
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-2xl p-6 text-center hover:border-purple-700/60 transition-colors">
          <span className="w-11 h-11 mx-auto rounded-xl bg-purple-900/30 border border-purple-900/40 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
            </svg>
          </span>
          <h3 className="text-white font-semibold mb-1">Totalmente personalizable</h3>
          <p className="text-purple-300 text-sm leading-relaxed">Nombres, dedicatoria secreta y temática a tu gusto.</p>
        </div>
        <div className="bg-slate-800/60 border border-purple-900/30 rounded-2xl p-6 text-center hover:border-purple-700/60 transition-colors">
          <span className="w-11 h-11 mx-auto rounded-xl bg-purple-900/30 border border-purple-900/40 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
          </span>
          <h3 className="text-white font-semibold mb-1">Comparte con un enlace</h3>
          <p className="text-purple-300 text-sm leading-relaxed">Envía el regalo por WhatsApp, redes sociales o email.</p>
        </div>
      </div>
    </div>
  )
}
