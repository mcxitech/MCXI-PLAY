import Phaser from 'phaser'
import type { GameConfig } from './config'
import { DEFAULT_CONFIG, hexToNumber } from './config'
import { addPreviewWatermark, dedicationForEdition, IS_FULL_EDITION } from './edition'
import { addBackground, themeStyle, TEXT_SHADOW } from './art'

const FONT = 'system-ui, sans-serif'
const PAPER = 0xfffaf3
const INK = '#3b2a4a'

export default class VictoryScene extends Phaser.Scene {
  private gameConfig: GameConfig = DEFAULT_CONFIG
  private typing?: Phaser.Time.TimerEvent
  private dedicationText?: Phaser.GameObjects.Text
  private fullDedication = ''

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
    const style = themeStyle(this.gameConfig.theme)
    const primary = hexToNumber(this.gameConfig.primaryColor)

    this.cameras.main.fadeIn(400, 0, 0, 0)
    addBackground(this, style)
    addPreviewWatermark(this)

    // Confetti bursts + gentle rain
    const confetti = this.add
      .particles(0, 0, 'confetti', {
        x: { min: 0, max: width },
        y: -10,
        lifespan: 4500,
        speedY: { min: 60, max: 160 },
        speedX: { min: -40, max: 40 },
        rotate: { start: 0, end: 360 },
        scale: { min: 0.8, max: 1.4 },
        tint: style.confettiTints,
        gravityY: 40,
        frequency: 120,
      })
      .setDepth(1)
    const burst = this.add
      .particles(0, 0, 'confetti', {
        lifespan: 2200,
        speed: { min: 150, max: 380 },
        angle: { min: 200, max: 340 },
        gravityY: 320,
        rotate: { start: 0, end: 540 },
        scale: { min: 0.8, max: 1.5 },
        tint: style.confettiTints,
        emitting: false,
      })
      .setDepth(15)
    burst.explode(70, width / 2, height * 0.55)
    this.time.delayedCall(4000, () => (confetti.frequency = 400))

    const title = this.add
      .text(width / 2, 72, `¡Lo lograste, ${this.gameConfig.recipientName}!`, {
        fontFamily: FONT,
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 40 },
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(5)
    this.tweens.add({ targets: title, scale: 1, duration: 500, ease: 'Back.easeOut' })
    const sub = this.add
      .text(width / 2, 112, 'Atrapaste todos los corazones y desbloqueaste un mensaje', {
        fontFamily: FONT,
        fontSize: '13px',
        color: '#f0abfc',
        align: 'center',
        wordWrap: { width: width - 60 },
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(5)
    this.tweens.add({ targets: sub, alpha: 1, delay: 300, duration: 400 })

    this.playEnvelope(width, height, primary)
  }

  private playEnvelope(w: number, h: number, primary: number) {
    const ex = w / 2
    const ey = 330
    const ew = 230
    const eh = 150

    const envelope = this.add.container(ex, ey).setDepth(6).setScale(0)
    const body = this.add.graphics()
    body.fillStyle(0xfde7d9, 1)
    body.fillRoundedRect(-ew / 2, -eh / 2, ew, eh, 10)
    body.lineStyle(2, 0xe8c4b0, 1)
    body.lineBetween(-ew / 2 + 6, eh / 2 - 6, 0, 5)
    body.lineBetween(ew / 2 - 6, eh / 2 - 6, 0, 5)

    // Flap pivots on the envelope's top edge: flipping scaleY to -1 "opens" it
    const flap = this.add.container(0, -eh / 2)
    const flapG = this.add.graphics()
    flapG.fillStyle(0xf6d3bf, 1)
    flapG.fillTriangle(-ew / 2, 0, ew / 2, 0, 0, eh * 0.62)
    const seal = this.add.image(0, eh * 0.5, 'heart').setScale(0.8)
    flap.add([flapG, seal])
    envelope.add([body, flap])

    this.tweens.add({ targets: envelope, scale: 1, duration: 600, delay: 200, ease: 'Back.easeOut' })
    this.tweens.add({ targets: envelope, y: ey - 6, yoyo: true, repeat: 2, duration: 250, delay: 800 })

    this.time.delayedCall(1700, () => {
      this.tweens.add({ targets: seal, scale: 0, duration: 200, ease: 'Back.easeIn' })
      this.tweens.add({
        targets: flap,
        scaleY: -1,
        duration: 450,
        delay: 150,
        ease: 'Cubic.easeInOut',
        onComplete: () => {
          this.tweens.add({ targets: envelope, y: h + 120, alpha: 0, duration: 700, delay: 350, ease: 'Cubic.easeIn' })
          this.showLetter(w, ey, primary)
        },
      })
    })
  }

  private showLetter(w: number, fromY: number, primary: number) {
    const cw = 320
    const ch = 300
    const cy = 320
    const card = this.add.container(w / 2, fromY - 20).setDepth(7).setScale(0.35).setAlpha(0)

    const paper = this.add.graphics()
    paper.fillStyle(0x000000, 0.25)
    paper.fillRoundedRect(-cw / 2 + 4, -ch / 2 + 6, cw, ch, 16)
    paper.fillStyle(PAPER, 1)
    paper.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 16)
    paper.lineStyle(1, 0xf1e4d6, 1)
    // ruled lines sit just under each text line (17px font + 6px spacing ≈ 26px)
    for (let y = -ch / 2 + 90; y < ch / 2 - 50; y += 26) paper.lineBetween(-cw / 2 + 22, y, cw / 2 - 22, y)
    paper.fillStyle(primary, 1)
    paper.fillRoundedRect(-cw / 2, -ch / 2, cw, 8, { tl: 16, tr: 16, bl: 0, br: 0 })

    const header = this.add
      .text(0, -ch / 2 + 38, `Para ${this.gameConfig.recipientName}`, {
        fontFamily: FONT,
        fontSize: '22px',
        fontStyle: 'bold',
        color: this.gameConfig.primaryColor,
      })
      .setOrigin(0.5)

    this.fullDedication = dedicationForEdition(this.gameConfig.dedication)
    this.dedicationText = this.add
      .text(-cw / 2 + 24, -ch / 2 + 66, '', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '17px',
        fontStyle: 'italic',
        color: INK,
        lineSpacing: 6,
        wordWrap: { width: cw - 48 },
      })
      .setOrigin(0, 0)

    const signature = this.add
      .text(cw / 2 - 24, ch / 2 - 30, `Con cariño, ${this.gameConfig.senderName}`, {
        fontFamily: FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: this.gameConfig.primaryColor,
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)
    const mini = this.add.image(-cw / 2 + 30, ch / 2 - 30, 'heart-small').setScale(0.8).setAlpha(0)

    card.add([paper, header, this.dedicationText, signature, mini])

    this.tweens.add({
      targets: card,
      y: cy,
      scale: 1,
      alpha: 1,
      duration: 750,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.typeDedication(() => {
          this.tweens.add({ targets: [signature, mini], alpha: 1, duration: 500 })
          this.showActions(w, cy + ch / 2)
        })
      },
    })
  }

  // Types the dedication letter by letter; a tap shows it all at once
  private typeDedication(done: () => void) {
    const text = this.fullDedication
    let i = 0
    const finish = () => {
      this.typing?.remove()
      this.dedicationText?.setText(`“${text}”`)
      this.input.off('pointerdown', finish)
      done()
    }
    this.input.once('pointerdown', finish)
    this.typing = this.time.addEvent({
      delay: 38,
      repeat: text.length - 1,
      callback: () => {
        i++
        this.dedicationText?.setText(`“${text.slice(0, i)}`)
        if (i >= text.length) finish()
      },
    })
  }

  private showActions(w: number, cardBottom: number) {
    let y = cardBottom + 34
    if (!IS_FULL_EDITION) {
      this.add
        .text(w / 2, y - 8, 'El mensaje completo se desbloquea al comprar', {
          fontFamily: FONT,
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#fbbf24',
          shadow: TEXT_SHADOW,
        })
        .setOrigin(0.5)
        .setDepth(8)
      y += 26
    }

    const btn = this.add.container(w / 2, y + 12).setDepth(8).setAlpha(0)
    const bg = this.add.graphics()
    bg.fillStyle(hexToNumber(this.gameConfig.primaryColor), 1)
    bg.fillRoundedRect(-90, -21, 180, 42, 21)
    const label = this.add
      .text(0, 0, 'Jugar de nuevo', { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5)
    btn.add([bg, label])
    btn.setSize(180, 42).setInteractive({ useHandCursor: true })
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
        this.scene.start('Main', { config: this.gameConfig, replay: true }),
      )
    })
    this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: 300 })
  }
}
