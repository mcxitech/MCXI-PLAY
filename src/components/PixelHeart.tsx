interface PixelHeartProps {
  className?: string
  color?: string
}

// 12x9 pixel-art heart, drawn as filled pixel rows.
const PIXELS =
  'M2 0h2v1h-2zM8 0h2v1h-2zM1 1h4v1h-4zM7 1h4v1h-4zM0 2h12v1H0zM0 3h12v1H0zM1 4h10v1h-10zM2 5h8v1h-8zM3 6h6v1h-6zM4 7h4v1h-4zM5 8h2v1h-2z'

export default function PixelHeart({ className, color = '#ff2d78' }: PixelHeartProps) {
  return (
    <svg viewBox="0 0 12 9" className={className} fill={color} aria-hidden="true">
      <path d={PIXELS} />
    </svg>
  )
}
