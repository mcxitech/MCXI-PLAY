export const SITE_NAME = 'MCXI Play'
export const SITE_TAGLINE = 'Regalos que se juegan'
export const CURRENCY = 'MXN'

export interface GameTemplate {
  slug: string
  name: string
  description: string
  shortDescription: string
  priceMxn: number
  image: string
  tags: string[]
  available: boolean
}

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    slug: 'atrapa-mi-corazon',
    name: 'Atrapa mi corazón',
    description:
      'Un juego arcade donde recoges diez corazones, esquivas obstáculos y desbloqueas una dedicatoria personalizada. Perfecto para San Valentín, cumpleaños o cualquier ocasión romántica.',
    shortDescription: 'Recoge corazones y desbloquea una dedicatoria especial.',
    priceMxn: 149,
    image: '/images/atrapa-mi-corazon.svg',
    tags: ['Romántico', 'Arcade', 'Dedicatoria'],
    available: true,
  },
]

// Manual payment details shown on the order page.
// TODO(owner): replace the placeholders with the real account before launch.
export const PAYMENT_INFO = {
  bank: '[Banco por configurar]',
  holder: '[Titular por configurar]',
  clabe: '[CLABE por configurar]',
  contact: '[WhatsApp o email por configurar]',
}

export function formatPriceMXN(price: number): string {
  return `$${price.toLocaleString('es-MX')} MXN`
}
