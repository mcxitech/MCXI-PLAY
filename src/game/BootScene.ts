import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    const { width, height } = this.scale

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x1e1b4b)
      .setOrigin(0.5)

    const barBg = this.add
      .rectangle(width / 2, height / 2 + 30, 200, 16, 0x312e81)
      .setOrigin(0.5)

    const barFill = this.add
      .rectangle(barBg.x - 98, height / 2 + 30, 4, 12, 0xc084fc)
      .setOrigin(0, 0.5)

    this.add
      .text(width / 2, height / 2 - 20, 'Cargando...', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#c084fc',
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: barFill,
      displayWidth: 196,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        const config = this.registry.get('gameConfig')
        this.scene.start('Main', { config })
      },
    })
  }
}
