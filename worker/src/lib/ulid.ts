const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function ulid(): string {
  const now = Date.now()
  let time = ''
  let t = now
  for (let i = 0; i < 10; i++) {
    time = ENCODING[t % 32]! + time
    t = Math.floor(t / 32)
  }

  let random = ''
  for (let i = 0; i < 16; i++) {
    random += ENCODING[Math.floor(Math.random() * 32)]!
  }

  return time + random
}

export function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = randomAlphanumeric(4)
  return `MCXI-${date}-${rand}`
}

export function generatePublicSlug(): string {
  return randomAlphanumeric(12)
}

export function generateBuyerToken(): string {
  return randomAlphanumeric(32)
}

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]!
  }
  return result
}
