import { Link } from 'react-router-dom'
import type { GameTemplate } from '@/lib/constants'
import { formatPriceMXN } from '@/lib/constants'

export default function GameCard({ game }: { game: GameTemplate }) {
  return (
    <div className="bg-slate-800/60 border border-purple-900/30 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group">
      <div className="aspect-video bg-gradient-to-br from-purple-900/40 to-pink-900/30 flex items-center justify-center p-6">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-5">
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
        <h3 className="text-lg font-semibold text-white mb-1">{game.name}</h3>
        <p className="text-sm text-purple-300 mb-4">{game.shortDescription}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-purple-400">
            {formatPriceMXN(game.priceMxn)}
          </span>
          <Link
            to={`/juego/${game.slug}`}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ver juego
          </Link>
        </div>
      </div>
    </div>
  )
}
