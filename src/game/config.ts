export interface GameConfig {
  recipientName: string
  senderName: string
  dedication: string
  theme: 'romantic' | 'birthday' | 'friendship'
  primaryColor: string
  secondaryColor: string
}

export const DEFAULT_CONFIG: GameConfig = {
  recipientName: 'Jugador',
  senderName: 'Tu admirador secreto',
  dedication: '¡Este juego fue hecho especialmente para ti!',
  theme: 'romantic',
  primaryColor: '#e91e63',
  secondaryColor: '#9c27b0',
}

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}
