import type { GameConfig } from '@/game/config'

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; errors?: { message: string }[] }
    throw new Error(body.error ?? body.errors?.[0]?.message ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  createOrder: (data: {
    buyerName: string
    buyerEmail: string
    templateSlug: string
    personalization: GameConfig
  }) => request<OrderCreated>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  order: (orderNumber: string) => request<OrderStatus>(`/orders/${encodeURIComponent(orderNumber)}`),
  gift: (publicSlug: string) => request<GiftPlay>(`/gifts/${encodeURIComponent(publicSlug)}`),
  manage: (buyerToken: string) => request<GiftManage>(`/gifts/manage/${encodeURIComponent(buyerToken)}`),
}

export type OrderState = 'pending' | 'paid' | 'activated' | 'cancelled'

export interface OrderCreated {
  orderNumber: string
  status: OrderState
  priceMxn: number // centavos
  createdAt: string
}

export interface OrderStatus extends OrderCreated {
  gameName: string
}

export interface GiftPlay {
  config: GameConfig
  playCount: number
}

export interface GiftManage {
  publicSlug: string
  config: GameConfig
  playCount: number
  active: boolean
  gameName: string
  orderNumber: string
  createdAt: string
}
