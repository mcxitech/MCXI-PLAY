// Standalone entry for exported gifts (ZIP). No React, no API, no network:
// the gift config comes from config.js, which sets window.MCXI_GIFT_CONFIG.
import { createGame } from '@/game/createGame'
import type { GameConfig } from '@/game/config'

declare global {
  interface Window {
    MCXI_GIFT_CONFIG?: Partial<GameConfig>
  }
}

const parent = document.getElementById('game')
if (parent) createGame(parent, window.MCXI_GIFT_CONFIG)
