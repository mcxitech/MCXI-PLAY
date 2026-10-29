import Phaser from 'phaser'

// Sounds are synthesized with Web Audio (no audio files). Mobile browsers only allow
// audio after a user gesture, so they are created when the player taps to start.

type Note = [freq: number, start: number, dur: number]

function synth(ctx: BaseAudioContext, notes: Note[], wave: (t: number, f: number) => number, gain: number): AudioBuffer {
  const sr = ctx.sampleRate
  const total = Math.max(...notes.map(([, s, d]) => s + d))
  const buffer = ctx.createBuffer(1, Math.ceil(sr * total), sr)
  const data = buffer.getChannelData(0)
  for (const [f, start, dur] of notes) {
    const from = Math.floor(start * sr)
    const len = Math.floor(dur * sr)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      data[from + i] = (data[from + i] ?? 0) + wave(t, f) * Math.exp((-t * 6) / dur) * gain
    }
  }
  return buffer
}

const sine = (t: number, f: number) => Math.sin(2 * Math.PI * f * t)
const soft = (t: number, f: number) => 0.7 * Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)

function create(scene: Phaser.Scene) {
  const mgr = scene.sound as Phaser.Sound.WebAudioSoundManager
  if (!mgr.context || scene.cache.audio.exists('collect')) return
  try {
    const ctx = mgr.context
    scene.cache.audio.add('collect', synth(ctx, [[880, 0, 0.12], [1320, 0.05, 0.12]], soft, 0.25))
    scene.cache.audio.add('bonk', synth(ctx, [[180, 0, 0.18], [120, 0.05, 0.2]], sine, 0.35))
    // C major arpeggio + chord
    scene.cache.audio.add(
      'win',
      synth(ctx, [[523, 0, 0.3], [659, 0.12, 0.3], [784, 0.24, 0.3], [1047, 0.36, 0.7], [784, 0.36, 0.7], [659, 0.36, 0.7]], soft, 0.18),
    )
  } catch {
    // Audio not available: the game works silently
  }
}

export function ensureSounds(scene: Phaser.Scene) {
  if (scene.sound.locked) scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => create(scene))
  else create(scene)
}

export function playSound(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) {
  if (!scene.cache.audio.exists(key)) return
  try {
    scene.sound.play(key, config)
  } catch {
    // ignore audio errors
  }
}
