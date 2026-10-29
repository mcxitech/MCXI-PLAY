import Phaser from 'phaser'
import type { GameConfig } from './config'
import { DEFAULT_CONFIG, hexToNumber } from './config'
import { addPreviewWatermark } from './edition'
import { addBackground, themeStyle, TEXT_SHADOW } from './art'
import { ensureSounds, playSound } from './sounds'

const TOTAL_HEARTS = 10
const CHEERS = ['¡Bien!', '¡Eso!', '💖', '¡Sigue!', '✨', '¡Wow!', '¡Ya casi!']

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private playerBody!: Phaser.GameObjects.Image
  private eyes!: Phaser.GameObjects.Image
  private hearts: Phaser.GameObjects.Image[] = []
  private obstacles: Phaser.GameObjects.Image[] = []
  private slots: Phaser.GameObjects.Image[] = []
  private collected = 0
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private paused = false
  private started = false
  private replay = false
  private pauseOverlay!: Phaser.GameObjects.Container
  private gameConfig: GameConfig = DEFAULT_CONFIG
  private playerSpeed = 300
  private touchPointer: Phaser.Input.Pointer | null = null
  private gameOver = false
  private invulnerableUntil = 0
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter
  private trail!: Phaser.GameObjects.Particles.ParticleEmitter

  constructor() {
    super('Main')
  }

  init(data: { config?: GameConfig; replay?: boolean }) {
    if (data.config) {
      this.gameConfig = { ...DEFAULT_CONFIG, ...data.config }
    }
    this.replay = Boolean(data.replay)
    this.collected = 0
    this.gameOver = false
    this.paused = false
    this.started = false
    this.invulnerableUntil = 0
    this.hearts = []
    this.obstacles = []
    this.slots = []
  }

  create() {
    const { width, height } = this.scale
    const primary = hexToNumber(this.gameConfig.primaryColor)

    addBackground(this, themeStyle(this.gameConfig.theme))
    addPreviewWatermark(this)

    this.trail = this.add
      .particles(0, 0, 'dot', {
        lifespan: 450,
        speed: 0,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.45, end: 0 },
        tint: primary,
        blendMode: 'ADD',
        frequency: 35,
        emitting: false,
      })
      .setDepth(4)
    this.player = this.createPlayer(width / 2, height - 70)
    this.trail.startFollow(this.player)

    this.spawnHearts(width, height)
    this.spawnObstacles(width, height)

    this.sparks = this.add
      .particles(0, 0, 'spark', {
        lifespan: 700,
        speed: { min: 80, max: 230 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 1, end: 0 },
        rotate: { min: 0, max: 360 },
        tint: [0xffffff, primary],
        blendMode: 'ADD',
        emitting: false,
      })
      .setDepth(8)

    this.createHud(width)

    this.pauseOverlay = this.createPauseOverlay(width, height)
    this.pauseOverlay.setVisible(false)

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      this.input.keyboard.on('keydown-P', () => this.togglePause())
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.started || this.paused || this.gameOver) return
      this.touchPointer = pointer
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.started && !this.paused && !this.gameOver) {
        this.touchPointer = pointer
      }
    })
    this.input.on('pointerup', () => {
      this.touchPointer = null
    })

    this.time.addEvent({ delay: 2800, loop: true, callback: () => this.blink() })

    if (this.replay) this.startPlaying()
    else this.showIntro(width, height)
  }

  update(time: number, delta: number) {
    if (!this.started || this.paused || this.gameOver) return

    const dt = delta / 1000
    const moving = this.movePlayer(dt)
    this.trail.emitting = moving
    this.checkCollisions(time)
    this.moveObstacles(dt)
  }

  // ---- intro ----

  private showIntro(w: number, h: number) {
    const c = this.add.container(0, 0).setDepth(30)
    const shade = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55)
    const panel = this.add.graphics()
    panel.fillStyle(0xffffff, 0.08)
    panel.fillRoundedRect(30, h / 2 - 150, w - 60, 270, 22)
    panel.lineStyle(1.5, 0xffffff, 0.2)
    panel.strokeRoundedRect(30, h / 2 - 150, w - 60, 270, 22)
    const heart = this.add.image(w / 2, h / 2 - 108, 'heart').setScale(1.2)
    this.tweens.add({ targets: heart, scale: 1.4, yoyo: true, repeat: -1, duration: 650, ease: 'Sine.easeInOut' })

    const txt = (y: number, s: string, size: number, color: string, bold = false) =>
      this.add
        .text(w / 2, y, s, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: `${size}px`,
          fontStyle: bold ? 'bold' : 'normal',
          color,
          align: 'center',
          wordWrap: { width: w - 90 },
          shadow: TEXT_SHADOW,
        })
        .setOrigin(0.5)

    const parts = [
      txt(h / 2 - 62, 'Un juego para', 15, '#f0abfc'),
      txt(h / 2 - 30, this.gameConfig.recipientName, 30, '#ffffff', true),
      txt(h / 2 + 4, `de parte de ${this.gameConfig.senderName}`, 15, '#f0abfc'),
      txt(h / 2 + 46, 'Atrapa los 10 corazones para descubrir su mensaje 💌', 14, '#ffffff'),
      txt(h / 2 + 92, 'Flechas del teclado o arrastra el dedo', 11, '#c4b5fd'),
    ]
    const tap = txt(h / 2 + 160, 'Toca para empezar', 20, '#ffffff', true)
    this.tweens.add({ targets: tap, alpha: 0.35, yoyo: true, repeat: -1, duration: 700 })

    c.add([shade, panel, heart, ...parts, tap])
    c.setAlpha(0)
    this.tweens.add({ targets: c, alpha: 1, duration: 400 })

    const begin = () => {
      this.input.keyboard?.off('keydown', begin)
      this.input.off('pointerdown', begin)
      this.tweens.add({ targets: c, alpha: 0, duration: 300, onComplete: () => c.destroy() })
      this.startPlaying()
    }
    // Next tick, so the tap that opened the game doesn't also start it
    this.time.delayedCall(250, () => {
      this.input.once('pointerdown', begin)
      this.input.keyboard?.once('keydown', begin)
    })
  }

  private startPlaying() {
    this.started = true
    ensureSounds(this)
  }

  // ---- movement & collisions ----

  private movePlayer(dt: number): boolean {
    const { width, height } = this.scale
    let vx = 0
    let vy = 0

    if (this.cursors?.left.isDown) vx = -1
    else if (this.cursors?.right.isDown) vx = 1
    if (this.cursors?.up.isDown) vy = -1
    else if (this.cursors?.down.isDown) vy = 1

    if (this.touchPointer?.isDown) {
      const dx = this.touchPointer.x - this.player.x
      const dy = this.touchPointer.y - this.player.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 10) {
        vx = dx / dist
        vy = dy / dist
      }
    }

    const len = Math.sqrt(vx * vx + vy * vy)
    if (len > 0) {
      vx /= len
      vy /= len
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + vx * this.playerSpeed * dt, 22, width - 22)
    this.player.y = Phaser.Math.Clamp(this.player.y + vy * this.playerSpeed * dt, 50, height - 22)

    // squash & stretch + lean
    const moving = len > 0
    const lerp = Math.min(1, dt * 12)
    const targetSX = moving ? 1.08 : 1
    const targetSY = moving ? 0.93 : 1
    this.playerBody.scaleX += (targetSX - this.playerBody.scaleX) * lerp
    this.playerBody.scaleY += (targetSY - this.playerBody.scaleY) * lerp
    this.player.angle += (vx * 12 - this.player.angle) * lerp
    return moving
  }

  private checkCollisions(time: number) {
    const px = this.player.x
    const py = this.player.y
    const pr = 19

    for (const h of this.hearts) {
      if (!h.active) continue
      if (Phaser.Math.Distance.Between(px, py, h.x, h.y) < pr + 15) this.collectHeart(h)
    }

    if (time < this.invulnerableUntil) return
    for (const obs of this.obstacles) {
      if (Phaser.Math.Distance.Between(px, py, obs.x, obs.y) < pr + 15) {
        this.hitObstacle(obs, time)
        break
      }
    }
  }

  private collectHeart(h: Phaser.GameObjects.Image) {
    h.setActive(false)
    this.tweens.killTweensOf(h)
    this.collected++
    this.sparks.explode(16, h.x, h.y)
    playSound(this, 'collect', { detune: this.collected * 90 })
    this.floatText(h.x, h.y - 20, Phaser.Utils.Array.GetRandom(CHEERS) as string)

    const slot = this.slots[this.collected - 1]
    if (slot) {
      this.tweens.add({
        targets: h,
        x: slot.x,
        y: slot.y,
        scale: 0.45,
        duration: 450,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          h.destroy()
          slot.setAlpha(1).clearTint()
          this.tweens.add({ targets: slot, scale: 0.85, yoyo: true, duration: 120 })
        },
      })
    } else {
      h.destroy()
    }

    if (this.collected >= TOTAL_HEARTS) this.winGame()
  }

  private hitObstacle(obs: Phaser.GameObjects.Image, time: number) {
    this.invulnerableUntil = time + 900
    this.cameras.main.shake(160, 0.008)
    playSound(this, 'bonk')
    this.playerBody.setTint(0xff8080)
    this.time.delayedCall(250, () => this.playerBody.clearTint())
    this.tweens.add({ targets: this.player, alpha: 0.35, yoyo: true, duration: 110, repeat: 3, onComplete: () => this.player.setAlpha(1) })
    this.floatText(this.player.x, this.player.y - 30, '¡Ay!', '#ffb4b4')

    const dx = this.player.x - obs.x
    const dy = this.player.y - obs.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    this.player.x += (dx / dist) * 40
    this.player.y += (dy / dist) * 40
  }

  private moveObstacles(dt: number) {
    const { width, height } = this.scale
    for (const obs of this.obstacles) {
      const v = obs.getData('vel') as { vx: number; vy: number; spin: number }
      obs.x += v.vx * dt
      obs.y += v.vy * dt
      obs.angle += v.spin * dt
      if (obs.x < -30) obs.x = width + 30
      if (obs.x > width + 30) obs.x = -30
      if (obs.y < 40) obs.y = height + 30
      if (obs.y > height + 30) obs.y = 40
    }
  }

  private winGame() {
    this.gameOver = true
    this.trail.emitting = false
    this.time.delayedCall(450, () => {
      this.cameras.main.flash(350, 255, 255, 255)
      this.sparks.explode(50, this.player.x, this.player.y)
      playSound(this, 'win')
    })
    this.time.delayedCall(1300, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
        this.scene.start('Victory', { config: this.gameConfig }),
      )
    })
  }

  private togglePause() {
    if (!this.started || this.gameOver) return
    this.paused = !this.paused
    this.pauseOverlay.setVisible(this.paused)
    this.trail.emitting = false
    if (this.paused) this.tweens.pauseAll()
    else this.tweens.resumeAll()
  }

  // ---- objects ----

  private createPlayer(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y)
    this.playerBody = this.add.image(0, 0, 'player')
    this.eyes = this.add.image(0, -1, 'eyes')
    c.add([this.playerBody, this.eyes])
    c.setDepth(5)
    // idle bounce
    this.tweens.add({ targets: this.playerBody, y: -3, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' })
    this.tweens.add({ targets: this.eyes, y: -4, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' })
    return c
  }

  private blink() {
    if (!this.eyes?.active) return
    this.tweens.add({ targets: this.eyes, scaleY: 0.1, yoyo: true, duration: 70 })
  }

  private spawnHearts(w: number, h: number) {
    const placed: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(w / 2, h - 70)]
    for (let i = 0; i < TOTAL_HEARTS; i++) {
      let x = 0
      let y = 0
      // keep hearts apart from each other and from the player's start
      for (let tries = 0; tries < 30; tries++) {
        x = Phaser.Math.Between(36, w - 36)
        y = Phaser.Math.Between(90, h - 130)
        if (placed.every((p) => Phaser.Math.Distance.Between(p.x, p.y, x, y) > 55)) break
      }
      placed.push(new Phaser.Math.Vector2(x, y))
      const heart = this.add.image(x, y, 'heart').setDepth(6).setScale(0)
      this.tweens.add({ targets: heart, scale: 1, duration: 400, delay: 80 * i, ease: 'Back.easeOut' })
      this.tweens.add({ targets: heart, y: y - 6, yoyo: true, repeat: -1, duration: 900 + Math.random() * 500, ease: 'Sine.easeInOut' })
      this.tweens.add({ targets: heart, angle: { from: -6, to: 6 }, yoyo: true, repeat: -1, duration: 1100 + Math.random() * 400, ease: 'Sine.easeInOut' })
      this.hearts.push(heart)
    }
  }

  private spawnObstacles(w: number, h: number) {
    for (let i = 0; i < 4; i++) {
      const key = i % 2 === 0 ? 'obs-cloud' : 'obs-spike'
      const obs = this.add.image(Phaser.Math.Between(40, w - 40), Phaser.Math.Between(90, h - 160), key).setDepth(3)
      const speed = 40 + Math.random() * 60
      const angle = Math.random() * Math.PI * 2
      obs.setData('vel', {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: key === 'obs-spike' ? 90 : 0,
      })
      if (key === 'obs-cloud') {
        this.tweens.add({ targets: obs, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 700 })
      }
      this.obstacles.push(obs)
    }
  }

  private createHud(w: number) {
    const bar = this.add.graphics().setDepth(10)
    bar.fillStyle(0x000000, 0.35)
    bar.fillRoundedRect(10, 10, 246, 34, 17)
    for (let i = 0; i < TOTAL_HEARTS; i++) {
      const slot = this.add
        .image(31 + i * 23, 27, 'heart-small')
        .setScale(0.7)
        .setDepth(11)
        .setAlpha(0.35)
        .setTint(0x555577)
      this.slots.push(slot)
    }

    const pauseBg = this.add.circle(w - 28, 27, 17, 0x000000, 0.35).setDepth(10)
    this.add
      .text(w - 28, 27, '❚❚', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(11)
    pauseBg.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.togglePause())
  }

  private floatText(x: number, y: number, s: string, color = '#ffffff') {
    const t = this.add
      .text(x, y, s, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color,
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5)
      .setDepth(12)
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, ease: 'Cubic.easeOut', onComplete: () => t.destroy() })
  }

  private createPauseOverlay(w: number, h: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0).setDepth(20)
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6)
    const panel = this.add.graphics()
    panel.fillStyle(0x1e1b4b, 0.95)
    panel.fillRoundedRect(w / 2 - 120, h / 2 - 70, 240, 140, 20)
    const title = this.add
      .text(w / 2, h / 2 - 25, 'Pausa', { fontFamily: 'system-ui, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5)
    const hint = this.add
      .text(w / 2, h / 2 + 22, 'Toca ❚❚ o presiona P\npara continuar', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#f0abfc',
        align: 'center',
      })
      .setOrigin(0.5)
    c.add([bg, panel, title, hint])
    return c
  }
}
