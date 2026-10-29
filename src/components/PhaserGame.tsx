import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'
import type { GameConfig } from '@/game/config'

interface Props {
  config?: Partial<GameConfig>
  className?: string
}

export default function PhaserGame({ config, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    let destroyed = false

    async function init() {
      const { createGame } = await import('@/game/createGame')
      if (destroyed || !containerRef.current) return
      gameRef.current = createGame(containerRef.current, config)
    }

    init()

    return () => {
      destroyed = true
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`aspect-[2/3] rounded-xl overflow-hidden ${className ?? ''}`}
    />
  )
}
