export interface ValidationError {
  field: string
  message: string
}

export function validateOrderInput(body: unknown): { data: OrderInput; errors: null } | { data: null; errors: ValidationError[] } {
  if (!body || typeof body !== 'object') {
    return { data: null, errors: [{ field: 'body', message: 'Request body is required' }] }
  }

  const b = body as Record<string, unknown>
  const errors: ValidationError[] = []

  const buyerName = sanitize(b['buyerName'], 60)
  if (!buyerName) errors.push({ field: 'buyerName', message: 'Nombre del comprador requerido (máx 60 caracteres)' })

  const buyerEmail = sanitize(b['buyerEmail'], 120)
  if (!buyerEmail || !isEmail(buyerEmail)) errors.push({ field: 'buyerEmail', message: 'Email válido requerido' })

  const templateSlug = sanitize(b['templateSlug'], 60)
  if (!templateSlug) errors.push({ field: 'templateSlug', message: 'Slug de plantilla requerido' })

  const personalization = validatePersonalization(b['personalization'])
  if (!personalization) errors.push({ field: 'personalization', message: 'Personalización inválida' })

  if (errors.length > 0) return { data: null, errors }

  return {
    data: {
      buyerName: buyerName!,
      buyerEmail: buyerEmail!,
      templateSlug: templateSlug!,
      personalization: personalization!,
    },
    errors: null,
  }
}

export interface OrderInput {
  buyerName: string
  buyerEmail: string
  templateSlug: string
  personalization: PersonalizationInput
}

export interface PersonalizationInput {
  recipientName: string
  senderName: string
  dedication: string
  theme: string
  primaryColor: string
  secondaryColor: string
}

function validatePersonalization(p: unknown): PersonalizationInput | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>

  const recipientName = sanitize(o['recipientName'], 30)
  const senderName = sanitize(o['senderName'], 30)
  const dedication = sanitize(o['dedication'], 200)
  const theme = sanitize(o['theme'], 20)
  const primaryColor = sanitize(o['primaryColor'], 7)
  const secondaryColor = sanitize(o['secondaryColor'], 7)

  if (!recipientName || !senderName || !dedication || !theme) return null
  if (!['romantic', 'birthday', 'friendship'].includes(theme)) return null
  if (!isHexColor(primaryColor) || !isHexColor(secondaryColor)) return null

  return { recipientName, senderName, dedication, theme, primaryColor, secondaryColor }
}

function sanitize(val: unknown, maxLen: number): string | null {
  if (typeof val !== 'string') return null
  const cleaned = val.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim()
  if (cleaned.length === 0) return null
  return cleaned.slice(0, maxLen)
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function isHexColor(s: string | null): s is string {
  return s !== null && /^#[0-9a-fA-F]{6}$/.test(s)
}
