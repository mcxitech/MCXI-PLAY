import { useEffect, useRef } from 'react'
import PixelHeart from './PixelHeart'

interface HeartSpec {
  left: string
  top: string
  size: number
  color: string
  depth: number
  rot: number
  slow?: boolean
}

const HEARTS: HeartSpec[] = [
  { left: '6%', top: '16%', size: 34, color: '#ff2d78', depth: 22, rot: -12 },
  { left: '14%', top: '62%', size: 22, color: '#ffd166', depth: 14, rot: 9, slow: true },
  { left: '24%', top: '30%', size: 16, color: '#ff6fa0', depth: 34, rot: 6 },
  { left: '78%', top: '20%', size: 28, color: '#ffd166', depth: 18, rot: 14, slow: true },
  { left: '86%', top: '58%', size: 36, color: '#ff2d78', depth: 26, rot: -8 },
  { left: '68%', top: '74%', size: 18, color: '#ff6fa0', depth: 40, rot: 11 },
  { left: '92%', top: '34%', size: 14, color: '#ffb3d0', depth: 46, rot: -16 },
  { left: '4%', top: '82%', size: 18, color: '#ffb3d0', depth: 30, rot: 12 },
  { left: '46%', top: '8%', size: 14, color: '#ffd166', depth: 38, rot: -6 },
  { left: '58%', top: '88%', size: 24, color: '#ff2d78', depth: 16, rot: 7, slow: true },
]

// Floating pixel hearts with pointer parallax + idle float animation.
// Decorative only (aria-hidden); motion is disabled under prefers-reduced-motion.
export default function FloatingHearts() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        for (const el of container.querySelectorAll<HTMLElement>('[data-depth]')) {
          const depth = Number(el.dataset.depth)
          el.style.setProperty('translate', `${(-x * depth).toFixed(1)}px ${(-y * depth).toFixed(1)}px`)
        }
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <span
          key={i}
          data-depth={h.depth}
          className={`absolute will-change-transform ${h.slow ? 'animate-float-slow' : 'animate-float'}`}
          style={{
            left: h.left,
            top: h.top,
            width: h.size,
            height: h.size * 0.75,
            ['--float-rot' as string]: `${h.rot}deg`,
            animationDelay: `${(i % 5) * 0.9}s`,
          }}
        >
          <PixelHeart
            className="w-full h-full opacity-80 drop-shadow-[0_0_14px_rgba(255,45,120,0.35)]"
            color={h.color}
          />
        </span>
      ))}
    </div>
  )
}
