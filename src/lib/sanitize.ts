const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] ?? ch)
}

export function sanitizeText(input: string, maxLength: number): string {
  const stripped = input.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
  return stripped.slice(0, maxLength)
}

export const LIMITS = {
  recipientName: 30,
  senderName: 30,
  dedication: 200,
} as const
