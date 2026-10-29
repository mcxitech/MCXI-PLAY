const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function ulid(): string {
  const now = Date.now()
  let time = ''
  let t = now
  for (let i = 0; i < 10; i++) {
    time = ENCODING[t % 32]! + time
    t = Math.floor(t / 32)
  }

  return time + randomFrom(ENCODING, 16)
}

export function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  // 8 chars (~45 bits) so order numbers can't be enumerated (SEC-006)
  const rand = randomAlphanumeric(8)
  return `MCXI-${date}-${rand}`
}

export function generatePublicSlug(): string {
  return randomAlphanumeric(12)
}

export function generateBuyerToken(): string {
  return randomAlphanumeric(32)
}

function randomAlphanumeric(length: number): string {
  return randomFrom('ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz23456789', length)
}

// CSPRNG with rejection sampling to avoid modulo bias
function randomFrom(chars: string, length: number): string {
  const limit = 256 - (256 % chars.length)
  let result = ''
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2))
    for (const b of bytes) {
      if (b < limit) result += chars[b % chars.length]!
      if (result.length === length) break
    }
  }
  return result
}
