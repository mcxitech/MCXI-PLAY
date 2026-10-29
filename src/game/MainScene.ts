import Phaser from 'phaser'
import type { GameConfig } from './config'
import { DEFAULT_CONFIG, hexToNumber } from './config'

const TOTAL_HEARTS = 10
const OBSTACLE_TYPES = 2

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private hearts: Phaser.GameObjects.Container[] = []
  private obstacles: Phaser.GameObjects.Container[] = []
  private collected = 0
  private scoreText!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private paused = false
  private pauseOverlay!: Phaser.GameObjects.Container
  private gameConfig: GameConfig = DEFAULT_CONFIG
  private playerSpeed = 300
  private touchPointer: Phaser.Input.Pointer | null = null
  private gameOver = false
  private soundEnabled = true
  private collectSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound

  constructor() {
    super('Main')
  }

  init(data: { config?: GameConfig }) {
    if (data.config) {
      this.gameConfig = { ...DEFAULT_CONFIG, ...data.config }
    }
    this.collected = 0
    this.gameOver = false
    this.paused = false
    this.hearts = []
    this.obstacles = []
  }

  create() {
    const { width, height } = this.scale
    const primary = hexToNumber(this.gameConfig.primaryColor)
    const secondary = hexToNumber(this.gameConfig.secondaryColor)

    this.add.rectangle(width / 2, height / 2, width, height, 0x1e1b4b).setOrigin(0.5)

    this.addStars(width, height)

    this.player = this.createPlayer(width / 2, height - 60, primary)
    this.spawnHearts(width, height, primary)
    this.spawnObstacles(width, height, secondary)

    this.scoreText = this.add
      .text(16, 16, this.scoreLabel(), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#f0abfc',
      })
      .setDepth(10)

    this.add
      .text(width - 16, 16, '⏸', {
        fontSize: '24px',
      })
      .setOrigin(1, 0)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.togglePause())

    this.pauseOverlay = this.createPauseOverlay(width, height)
    this.pauseOverlay.setVisible(false)

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      this.input.keyboard.on('keydown-P', () => this.togglePause())
      this.input.keyboard.on('keydown-M', () => {
        this.soundEnabled = !this.soundEnabled
      })
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.paused || this.gameOver) return
      this.touchPointer = pointer
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.paused && !this.gameOver) {
        this.touchPointer = pointer
      }
    })
    this.input.on('pointerup', () => {
      this.touchPointer = null
    })

    this.generateCollectSound()
  }

  update(_time: number, delta: number) {
    if (this.paused || this.gameOver) return

    const dt = delta / 1000
    this.movePlayer(dt)
    this.checkCollisions()
    this.moveObstacles(dt)
    this.wrapPosition(this.player)
  }

  private movePlayer(dt: number) {
    const { width } = this.scale
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

    this.player.x += vx * this.playerSpeed * dt
    this.player.y += vy * this.playerSpeed * dt

    const { height } = this.scale
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, width - 20)
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, height - 20)
  }

  private checkCollisions() {
    const px = this.player.x
    const py = this.player.y
    const pr = 18

    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i]!
      if (!h.visible) continue
      const dist = Phaser.Math.Distance.Between(px, py, h.x, h.y)
      if (dist < pr + 14) {
        h.setVisible(false)
        this.collected++
        this.scoreText.setText(this.scoreLabel())
        this.playCollectSound()

        if (this.collected >= TOTAL_HEARTS) {
          this.winGame()
        }
      }
    }

    for (const obs of this.obstacles) {
      if (!obs.visible) continue
      const dist = Phaser.Math.Distance.Between(px, py, obs.x, obs.y)
      if (dist < pr + 12) {
        this.hitObstacle(obs)
      }
    }
  }

  private hitObstacle(obs: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      yoyo: true,
      duration: 100,
      repeat: 2,
      onComplete: () => this.player.setAlpha(1),
    })

    const dx = this.player.x - obs.x
    const dy = this.player.y - obs.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    this.player.x += (dx / dist) * 40
    this.player.y += (dy / dist) * 40
  }

  private moveObstacles(dt: number) {
    const { width, height } = this.scale
    for (const obs of this.obstacles) {
      const data = obs.getData('vel') as { vx: number; vy: number }
      obs.x += data.vx * dt
      obs.y += data.vy * dt

      if (obs.x < -20) obs.x = width + 20
      if (obs.x > width + 20) obs.x = -20
      if (obs.y < -20) obs.y = height + 20
      if (obs.y > height + 20) obs.y = -20

      obs.angle += 60 * dt
    }
  }

  private winGame() {
    this.gameOver = true
    this.scene.start('Victory', { config: this.gameConfig })
  }

  private togglePause() {
    this.paused = !this.paused
    this.pauseOverlay.setVisible(this.paused)
  }

  private createPlayer(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y)
    const body = this.add.circle(0, 0, 18, color)
    const eyeL = this.add.circle(-6, -5, 3, 0xffffff)
    const eyeR = this.add.circle(6, -5, 3, 0xffffff)
    const pupilL = this.add.circle(-5, -5, 1.5, 0x000000)
    const pupilR = this.add.circle(7, -5, 1.5, 0x000000)

    const mouth = this.add.graphics()
    mouth.lineStyle(2, 0xffffff)
    mouth.beginPath()
    mouth.arc(0, 2, 6, Phaser.Math.DegToRad(10), Phaser.Math.DegToRad(170), false)
    mouth.strokePath()

    c.add([body, eyeL, eyeR, pupilL, pupilR, mouth])
    c.setDepth(5)
    return c
  }

  private createHeart(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y)
    const g = this.add.graphics()
    g.fillStyle(color, 1)
    g.fillCircle(-6, -4, 7)
    g.fillCircle(6, -4, 7)
    const triangle = new Phaser.Geom.Triangle(-13, -2, 13, -2, 0, 14)
    g.fillTriangleShape(triangle)
    c.add(g)

    this.tweens.add({
      targets: c,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      repeat: -1,
      duration: 600 + Math.random() * 400,
      ease: 'Sine.easeInOut',
    })

    return c
  }

  private createObstacle(x: number, y: number, type: number, color: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y)
    const g = this.add.graphics()

    if (type === 0) {
      g.fillStyle(color, 0.8)
      const points: Phaser.Math.Vector2[] = []
      for (let j = 0; j < 10; j++) {
        const r = j % 2 === 0 ? 16 : 8
        const a = (j * Math.PI) / 5 - Math.PI / 2
        points.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r))
      }
      g.fillPoints(points, true)
    } else {
      g.fillStyle(color, 0.8)
      g.fillRect(-10, -10, 20, 20)
    }

    c.add(g)
    c.setDepth(3)
    return c
  }

  private spawnHearts(w: number, h: number, color: number) {
    const margin = 40
    for (let i = 0; i < TOTAL_HEARTS; i++) {
      const x = Phaser.Math.Between(margin, w - margin)
      const y = Phaser.Math.Between(margin, h - margin - 80)
      const heart = this.createHeart(x, y, color)
      this.hearts.push(heart)
    }
  }

  private spawnObstacles(w: number, h: number, color: number) {
    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(40, w - 40)
      const y = Phaser.Math.Between(40, h - 120)
      const type = i % OBSTACLE_TYPES
      const obs = this.createObstacle(x, y, type, color)
      const speed = 40 + Math.random() * 60
      const angle = Math.random() * Math.PI * 2
      obs.setData('vel', {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      })
      this.obstacles.push(obs)
    }
  }

  private addStars(w: number, h: number) {
    const g = this.add.graphics()
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const r = 0.5 + Math.random() * 1.5
      g.fillStyle(0xc084fc, 0.15 + Math.random() * 0.3)
      g.fillCircle(x, y, r)
    }
  }

  private createPauseOverlay(w: number, h: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0).setDepth(20)
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6)
    const txt = this.add
      .text(w / 2, h / 2, 'PAUSA\n\nPresiona P o toca ⏸\npara continuar', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#f0abfc',
        align: 'center',
      })
      .setOrigin(0.5)
    c.add([bg, txt])
    return c
  }

  private wrapPosition(obj: Phaser.GameObjects.Container) {
    const { width, height } = this.scale
    if (obj.x < -20) obj.x = width + 20
    if (obj.x > width + 20) obj.x = -20
    if (obj.y < -20) obj.y = height + 20
    if (obj.y > height + 20) obj.y = -20
  }

  private scoreLabel(): string {
    return `❤️ ${this.collected} / ${TOTAL_HEARTS}`
  }

  private generateCollectSound() {
    const mgr = this.sound as Phaser.Sound.WebAudioSoundManager
    if (!this.sound.locked && mgr.context) {
      try {
        const ctx = mgr.context
        const sr = ctx.sampleRate
        const len = sr * 0.15
        const buffer = ctx.createBuffer(1, len, sr)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < len; i++) {
          const t = i / sr
          data[i] = Math.sin(880 * 2 * Math.PI * t) * Math.exp(-t * 20) * 0.3
        }
        this.cache.audio.add('collect', buffer)
        this.collectSound = this.sound.add('collect', { volume: 0.4 })
      } catch {
        // Audio not available
      }
    }
  }

  private playCollectSound() {
    if (this.soundEnabled && this.collectSound) {
      try {
        this.collectSound.play()
      } catch {
        // Ignore audio errors
      }
    }
  }
}
