import Phaser from 'phaser'
import type { GameConfig } from './config'
import { DEFAULT_CONFIG, hexToNumber } from './config'
import { addPreviewWatermark, dedicationForEdition, IS_FULL_EDITION } from './edition'

export default class VictoryScene extends Phaser.Scene {
  private gameConfig: GameConfig = DEFAULT_CONFIG

  constructor() {
    super('Victory')
  }

  init(data: { config?: GameConfig }) {
    if (data.config) {
      this.gameConfig = { ...DEFAULT_CONFIG, ...data.config }
    }
  }

  create() {
    const { width, height } = this.scale
    const primary = hexToNumber(this.gameConfig.primaryColor)

    this.add.rectangle(width / 2, height / 2, width, height, 0x1e1b4b).setOrigin(0.5)

    this.spawnFloatingHearts(width, height, primary)

    const centerY = height / 2

    this.add
      .text(width / 2, centerY - 80, `¡${this.gameConfig.recipientName}!`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, centerY - 40, '¡Atrapaste todos los corazones!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#f0abfc',
      })
      .setOrigin(0.5)

    const dedBox = this.add.graphics()
    const dedWidth = Math.min(width - 60, 360)
    dedBox.fillStyle(0x312e81, 0.6)
    dedBox.fillRoundedRect(width / 2 - dedWidth / 2, centerY - 10, dedWidth, 80, 12)

    this.add
      .text(width / 2, centerY + 30, `"${dedicationForEdition(this.gameConfig.dedication)}"`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#e9d5ff',
        align: 'center',
        wordWrap: { width: dedWidth - 30 },
        fontStyle: 'italic',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, centerY + 90, `— ${this.gameConfig.senderName}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#c084fc',
      })
      .setOrigin(0.5)

    if (!IS_FULL_EDITION) {
      this.add
        .text(width / 2, centerY + 112, 'El mensaje completo se desbloquea al comprar', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          color: '#fbbf24',
        })
        .setOrigin(0.5)
    }
    addPreviewWatermark(this)

    const btnY = centerY + 150
    const btn = this.add.graphics()
    btn.fillStyle(primary, 1)
    btn.fillRoundedRect(width / 2 - 80, btnY - 18, 160, 36, 8)

    this.add
      .text(width / 2, btnY, 'Jugar de nuevo', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .zone(width / 2, btnY, 160, 36)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('Main', { config: this.gameConfig })
      })
  }

  private spawnFloatingHearts(w: number, h: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(20, w - 20)
      const y = Phaser.Math.Between(20, h - 20)
      const g = this.add.graphics()
      g.fillStyle(color, 0.2 + Math.random() * 0.2)
      g.fillCircle(-4, -3, 5)
      g.fillCircle(4, -3, 5)
      const tri = new Phaser.Geom.Triangle(-9, -1, 9, -1, 0, 10)
      g.fillTriangleShape(tri)
      g.setPosition(x, y)

      this.tweens.add({
        targets: g,
        y: y - 20 - Math.random() * 30,
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      })
    }
  }
}
