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

export function createSessionCookie(secure: boolean): string {
  const session: Session = { exp: Date.now() + SESSION_DURATION_MS }
  const token = btoa(JSON.stringify(session))
  const flags = `HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_DURATION_MS / 1000}${secure ? '; Secure' : ''}`
  return `${SESSION_COOKIE}=${token}; ${flags}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0`
}

export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('Cookie')
  if (!cookie) return false

  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  if (!match?.[1]) return false

  try {
    const session: Session = JSON.parse(atob(match[1]))
    return session.exp > Date.now()
  } catch {
    return false
  }
}
