import Phaser from 'phaser'

// Build-time flag (see vite.config.ts / vite.export.config.ts).
// Public SPA bundle (demo + customizer preview): false → the full-edition branches are
// removed by the minifier, so the public JS cannot render a clean, complete gift.
// Paid engine (served only by the Worker after activation): true.
declare const __MCXI_FULL__: boolean
export const IS_FULL_EDITION: boolean = __MCXI_FULL__

const TEASER_CHARS = 14

export function addPreviewWatermark(scene: Phaser.Scene) {
  if (IS_FULL_EDITION) return
  const { width, height } = scene.scale
  scene.add
    .text(width / 2, height / 2, 'VISTA PREVIA · MCXI Play', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setAngle(-30)
    .setAlpha(0.18)
    .setDepth(1000)
  scene.add
    .text(width / 2, height - 14, 'Vista previa — compra para recibir el regalo completo', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#f0abfc',
    })
    .setOrigin(0.5)
    .setDepth(1000)
}

// Preview shows only the start of the dedication; the full text needs the paid engine
export function dedicationForEdition(dedication: string): string {
  if (IS_FULL_EDITION) return dedication
  return dedication.length > TEASER_CHARS ? `${dedication.slice(0, TEASER_CHARS)}… 🔒` : '… 🔒'
}
