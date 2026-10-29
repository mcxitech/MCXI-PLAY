import Phaser from 'phaser'
import BootScene from './BootScene'
import MainScene from './MainScene'
import VictoryScene from './VictoryScene'
import type { GameConfig } from './config'

export function createGame(
  parent: HTMLElement,
  config?: Partial<GameConfig>,
): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 400,
    height: 600,
    backgroundColor: '#1e1b4b',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, MainScene, VictoryScene],
    audio: {
      disableWebAudio: false,
    },
  })

  game.registry.set('gameConfig', config)

  game.events.on('ready', () => {
    game.scene.start('Boot')
  })

  return game
}

export function destroyGame(game: Phaser.Game) {
  game.destroy(true)
}
