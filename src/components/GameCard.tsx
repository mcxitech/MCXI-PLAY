import { Link } from 'react-router-dom'
import type { GameTemplate } from '@/lib/constants'
import { formatPriceMXN } from '@/lib/constants'

export default function GameCard({ game }: { game: GameTemplate }) {
  return (
    <div className="h-full flex flex-col bg-slate-800/60 border border-purple-900/30 rounded-2xl overflow-hidden hover:border-purple-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/30 transition-all duration-300 group">
      <div className="aspect-video bg-gradient-to-br from-purple-900/40 to-pink-900/30 flex items-center justify-center p-6 overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-purple-900/40 text-purple-300 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-white mb-1.5">{game.name}</h3>
        <p className="text-sm text-purple-300 mb-5 flex-1 leading-relaxed">{game.shortDescription}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl font-bold text-purple-400">
            {formatPriceMXN(game.priceMxn)}
          </span>
          <Link
            to={`/juego/${game.slug}`}
            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
          >
            Ver juego
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
