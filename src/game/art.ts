import Phaser from 'phaser'
import type { GameConfig } from './config'

// All art is drawn in code with Canvas 2D at boot: no image files, no licenses,
// and the exported ZIP keeps working offline from file://.

export interface ThemeStyle {
  bgTop: string
  bgBottom: string
  glow: string
  deco: 'deco-heart' | 'deco-balloon' | 'deco-star'
  decoTints: number[]
  confettiTints: number[]
}

export const THEME_STYLES: Record<GameConfig['theme'], ThemeStyle> = {
  romantic: {
    bgTop: '#1b0b2e', bgBottom: '#5a1846', glow: '#ff5c8a',
    deco: 'deco-heart', decoTints: [0xff8fb1, 0xffc2d6, 0xff5c8a],
    confettiTints: [0xff5c8a, 0xffc2d6, 0xffffff, 0xffd166],
  },
  birthday: {
    bgTop: '#0b1640', bgBottom: '#1d5c8c', glow: '#6bcbff',
    deco: 'deco-balloon', decoTints: [0xff6b6b, 0xffd93d, 0x6bcbff, 0xb084ff],
    confettiTints: [0xff6b6b, 0xffd93d, 0x6bcbff, 0xb084ff, 0x7bf1a8],
  },
  friendship: {
    bgTop: '#120f3a', bgBottom: '#3d2c7a', glow: '#ffd166',
    deco: 'deco-star', decoTints: [0xffe66d, 0x8be9fd, 0xff9f43],
    confettiTints: [0xffe66d, 0x8be9fd, 0xff9f43, 0xffffff],
  },
}

export function themeStyle(theme: string): ThemeStyle {
  return THEME_STYLES[theme as GameConfig['theme']] ?? THEME_STYLES.romantic
}

// ---- color helpers ----
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, target: string, t: number): string {
  const a = rgb(hex)
  const b = rgb(target)
  const c = a.map((v, i) => Math.round(v + (b[i]! - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}
const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t)
const darken = (hex: string, t: number) => mix(hex, '#000000', t)

// ---- canvas helpers ----
function canvas(scene: Phaser.Scene, key: string, w: number, h: number): CanvasRenderingContext2D | null {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  const tex = scene.textures.createCanvas(key, w, h)
  return tex ? tex.getContext() : null
}
function refresh(scene: Phaser.Scene, key: string) {
  ;(scene.textures.get(key) as Phaser.Textures.CanvasTexture).refresh()
}

function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y + h * 0.3)
  ctx.bezierCurveTo(x + w / 2, y, x, y, x, y + h * 0.3)
  ctx.bezierCurveTo(x, y + h * 0.6, x + w / 2, y + h * 0.78, x + w / 2, y + h)
  ctx.bezierCurveTo(x + w / 2, y + h * 0.78, x + w, y + h * 0.6, x + w, y + h * 0.3)
  ctx.bezierCurveTo(x + w, y, x + w / 2, y, x + w / 2, y + h * 0.3)
  ctx.closePath()
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i * Math.PI) / points - Math.PI / 2
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// ---- textures ----

function drawGlossyHeart(scene: Phaser.Scene, key: string, color: string, size: number) {
  const pad = 12
  const ctx = canvas(scene, key, size + pad * 2, size + pad * 2)
  if (!ctx) return
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  const g = ctx.createLinearGradient(0, pad, 0, pad + size)
  g.addColorStop(0, lighten(color, 0.35))
  g.addColorStop(1, darken(color, 0.25))
  ctx.fillStyle = g
  heartPath(ctx, pad, pad, size, size * 0.92)
  ctx.fill()
  ctx.shadowBlur = 0
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.ellipse(pad + size * 0.3, pad + size * 0.28, size * 0.11, size * 0.07, -0.6, 0, Math.PI * 2)
  ctx.fill()
  refresh(scene, key)
}

function drawPlayer(scene: Phaser.Scene, color: string) {
  const s = 64
  const ctx = canvas(scene, 'player', s, s)
  if (!ctx) return
  const cx = s / 2
  const cy = s / 2 + 4
  // little heart "hair tuft"
  ctx.fillStyle = lighten(color, 0.2)
  heartPath(ctx, cx - 6, cy - 30, 12, 11)
  ctx.fill()
  // body with soft glow
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  const g = ctx.createRadialGradient(cx - 6, cy - 8, 3, cx, cy, 22)
  g.addColorStop(0, lighten(color, 0.45))
  g.addColorStop(1, darken(color, 0.15))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, 21, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  // cheeks
  ctx.fillStyle = 'rgba(255,170,190,0.65)'
  for (const dx of [-12, 12]) {
    ctx.beginPath()
    ctx.ellipse(cx + dx, cy + 5, 4.5, 3, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  // smile
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy + 4, 5.5, 0.2 * Math.PI, 0.8 * Math.PI)
  ctx.stroke()
  refresh(scene, 'player')

  // eyes are a separate texture so they can blink
  const e = canvas(scene, 'eyes', 30, 14)
  if (!e) return
  for (const ex of [7, 23]) {
    e.fillStyle = '#ffffff'
    e.beginPath()
    e.ellipse(ex, 7, 5, 6, 0, 0, Math.PI * 2)
    e.fill()
    e.fillStyle = '#1e1b4b'
    e.beginPath()
    e.arc(ex + 1, 8, 3, 0, Math.PI * 2)
    e.fill()
    e.fillStyle = '#ffffff'
    e.beginPath()
    e.arc(ex + 2, 6.5, 1.1, 0, Math.PI * 2)
    e.fill()
  }
  refresh(scene, 'eyes')
}

function drawObstacles(scene: Phaser.Scene) {
  // Storm cloud with grumpy face
  const c = canvas(scene, 'obs-cloud', 56, 44)
  if (c) {
    const g = c.createLinearGradient(0, 6, 0, 40)
    g.addColorStop(0, '#8b86b8')
    g.addColorStop(1, '#4b4677')
    c.fillStyle = g
    c.beginPath()
    c.arc(18, 24, 12, 0, Math.PI * 2)
    c.arc(30, 17, 13, 0, Math.PI * 2)
    c.arc(41, 25, 11, 0, Math.PI * 2)
    c.rect(14, 24, 30, 12)
    c.fill()
    c.fillStyle = '#ffe66d' // small lightning
    c.beginPath()
    c.moveTo(29, 34); c.lineTo(24, 43); c.lineTo(29, 41); c.lineTo(26, 44); c.lineTo(34, 37); c.lineTo(30, 38)
    c.closePath()
    c.fill()
    grumpyFace(c, 30, 25)
    refresh(scene, 'obs-cloud')
  }
  // Spiky ball
  const sp = canvas(scene, 'obs-spike', 48, 48)
  if (sp) {
    sp.fillStyle = '#3b3561'
    starPath(sp, 24, 24, 22, 14, 10)
    sp.fill()
    const g = sp.createRadialGradient(20, 19, 2, 24, 24, 15)
    g.addColorStop(0, '#9a8fd1')
    g.addColorStop(1, '#4b4677')
    sp.fillStyle = g
    sp.beginPath()
    sp.arc(24, 24, 14, 0, Math.PI * 2)
    sp.fill()
    grumpyFace(sp, 24, 24)
    refresh(scene, 'obs-spike')
  }
}

function grumpyFace(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#ffffff'
  for (const dx of [-5, 5]) {
    ctx.beginPath()
    ctx.arc(cx + dx, cy, 2.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#1e1b4b'
  for (const dx of [-5, 5]) {
    ctx.beginPath()
    ctx.arc(cx + dx, cy + 0.6, 1.3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#1e1b4b'
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.beginPath() // angry brows
  ctx.moveTo(cx - 8, cy - 5); ctx.lineTo(cx - 3, cy - 3)
  ctx.moveTo(cx + 8, cy - 5); ctx.lineTo(cx + 3, cy - 3)
  ctx.stroke()
  ctx.beginPath() // frown
  ctx.arc(cx, cy + 8, 3, 1.15 * Math.PI, 1.85 * Math.PI)
  ctx.stroke()
}

function drawParticles(scene: Phaser.Scene) {
  const sp = canvas(scene, 'spark', 20, 20)
  if (sp) {
    sp.shadowColor = '#ffffff'
    sp.shadowBlur = 6
    sp.fillStyle = '#ffffff'
    starPath(sp, 10, 10, 8, 2, 4)
    sp.fill()
    refresh(scene, 'spark')
  }
  const dot = canvas(scene, 'dot', 24, 24)
  if (dot) {
    const g = dot.createRadialGradient(12, 12, 0, 12, 12, 12)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    dot.fillStyle = g
    dot.fillRect(0, 0, 24, 24)
    refresh(scene, 'dot')
  }
  const cf = canvas(scene, 'confetti', 8, 5)
  if (cf) {
    cf.fillStyle = '#ffffff'
    cf.fillRect(0, 0, 8, 5)
    refresh(scene, 'confetti')
  }
  // White decorations, tinted per theme at runtime
  const dh = canvas(scene, 'deco-heart', 22, 22)
  if (dh) {
    dh.fillStyle = '#ffffff'
    heartPath(dh, 1, 2, 20, 18)
    dh.fill()
    refresh(scene, 'deco-heart')
  }
  const ds = canvas(scene, 'deco-star', 22, 22)
  if (ds) {
    ds.fillStyle = '#ffffff'
    starPath(ds, 11, 11, 10, 4.5, 5)
    ds.fill()
    refresh(scene, 'deco-star')
  }
  const db = canvas(scene, 'deco-balloon', 22, 40)
  if (db) {
    db.fillStyle = '#ffffff'
    db.beginPath()
    db.ellipse(11, 12, 9, 11, 0, 0, Math.PI * 2)
    db.fill()
    db.beginPath()
    db.moveTo(9, 22); db.lineTo(13, 22); db.lineTo(11, 25)
    db.fill()
    db.strokeStyle = 'rgba(255,255,255,0.8)'
    db.lineWidth = 1
    db.beginPath()
    db.moveTo(11, 25)
    db.quadraticCurveTo(7, 31, 11, 39)
    db.stroke()
    refresh(scene, 'deco-balloon')
  }
}

function drawBackground(scene: Phaser.Scene, style: ThemeStyle, w: number, h: number) {
  const ctx = canvas(scene, 'bg', w, h)
  if (!ctx) return
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, style.bgTop)
  g.addColorStop(1, style.bgBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // soft bokeh lights
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * 50
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, `${style.glow}22`)
    rg.addColorStop(1, `${style.glow}00`)
    ctx.fillStyle = rg
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // vignette
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)
  refresh(scene, 'bg')
}

export function generateArt(scene: Phaser.Scene, config: GameConfig) {
  const { width, height } = scene.scale
  const style = themeStyle(config.theme)
  drawBackground(scene, style, width, height)
  drawGlossyHeart(scene, 'heart', config.primaryColor, 34)
  drawGlossyHeart(scene, 'heart-small', config.primaryColor, 14)
  drawPlayer(scene, config.primaryColor)
  drawObstacles(scene)
  drawParticles(scene)
}

// ---- shared scene helpers ----

export function addBackground(scene: Phaser.Scene, style: ThemeStyle) {
  const { width, height } = scene.scale
  scene.add.image(width / 2, height / 2, 'bg').setDepth(-10)
  // twinkling stars
  for (let i = 0; i < 26; i++) {
    const s = scene.add
      .image(Math.random() * width, Math.random() * height, 'dot')
      .setScale(0.1 + Math.random() * 0.15)
      .setAlpha(0.2 + Math.random() * 0.4)
      .setDepth(-9)
    scene.tweens.add({
      targets: s,
      alpha: 0.05,
      duration: 900 + Math.random() * 1800,
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 1500,
    })
  }
  // themed decorations drifting upwards
  scene.add
    .particles(0, 0, style.deco, {
      x: { min: 0, max: width },
      y: height + 30,
      lifespan: 9000,
      speedY: { min: -45, max: -20 },
      speedX: { min: -8, max: 8 },
      scale: { min: 0.5, max: 1 },
      alpha: { start: 0.35, end: 0 },
      rotate: { min: -20, max: 20 },
      tint: style.decoTints,
      frequency: 900,
      quantity: 1,
    })
    .setDepth(-8)
}

export const TEXT_SHADOW = { offsetX: 0, offsetY: 2, color: '#000000', blur: 6, fill: true }
