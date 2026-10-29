import PixelHeart from './PixelHeart'

const OCCASIONS = [
  'San Valentín',
  'Cumpleaños',
  'Aniversarios',
  'Amistad',
  'Bodas',
  'Pedidas',
  'Solo porque sí',
]

function Strip() {
  return (
    <div className="flex items-center shrink-0">
      {OCCASIONS.map((occasion) => (
        <span key={occasion} className="flex items-center shrink-0">
          <span className="font-display font-semibold text-lg md:text-xl text-purple-200 px-6 whitespace-nowrap">
            {occasion}
          </span>
          <PixelHeart className="w-4 h-3 shrink-0" color="#ff2d78" />
        </span>
      ))}
    </div>
  )
}

// Infinite marquee of gift occasions (duplicated track, translateX -50%).
export default function OccasionsMarquee() {
  return (
    <div className="marquee-mask overflow-hidden border-y border-purple-900/30 bg-slate-950/60 py-4">
      <div className="marquee-track" aria-hidden="true">
        <Strip />
        <Strip />
      </div>
      <p className="sr-only">Ocasiones para regalar: {OCCASIONS.join(', ')}</p>
    </div>
  )
}
