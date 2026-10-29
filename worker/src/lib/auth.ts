const SESSION_COOKIE = 'mcxi_admin_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

interface Session {
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPassword(password)
  if (inputHash.length !== storedHash.length) return false
  let result = 0
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i)
  }
  return result === 0
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

// Session token = base64url(payload) + "." + base64url(HMAC-SHA256(payload, SESSION_SECRET))
export async function createSessionCookie(secure: boolean, secret: string): Promise<string> {
  const session: Session = { exp: Date.now() + SESSION_DURATION_MS }
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)))
  const key = await importHmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const token = `${payload}.${toBase64Url(new Uint8Array(signature))}`
  const flags = `HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_DURATION_MS / 1000}${secure ? '; Secure' : ''}`
  return `${SESSION_COOKIE}=${token}; ${flags}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0`
}

export async function isAuthenticated(request: Request, secret: string): Promise<boolean> {
  const cookie = request.headers.get('Cookie')
  if (!cookie) return false

  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]+)`))
  if (!match?.[1] || !match[2]) return false

  try {
    const key = await importHmacKey(secret)
    // crypto.subtle.verify compares in constant time
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(match[2]),
      new TextEncoder().encode(match[1]),
    )
    if (!valid) return false
    const session: Session = JSON.parse(new TextDecoder().decode(fromBase64Url(match[1])))
    return typeof session.exp === 'number' && session.exp > Date.now()
  } catch {
    return false
  }
}
