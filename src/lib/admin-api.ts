const BASE = '/api/admin'

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
    throw new Error(body.error ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const adminApi = {
  login: (password: string) => request<{ ok: boolean }>('/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request<{ ok: boolean }>('/logout', { method: 'POST' }),
  stats: () => request<Stats>('/stats'),
  orders: (status?: string, q?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    const qs = params.toString()
    return request<OrderAdmin[]>(`/orders${qs ? '?' + qs : ''}`)
  },
  order: (id: string) => request<OrderDetail>(`/orders/${id}`),
  pay: (id: string, paymentNote?: string) => request<{ ok: boolean; status: string }>(`/orders/${id}/pay`, { method: 'PATCH', body: JSON.stringify({ paymentNote }) }),
  activate: (id: string) => request<{ ok: boolean; status: string; publicSlug: string; buyerToken: string }>(`/orders/${id}/activate`, { method: 'PATCH' }),
  cancel: (id: string) => request<{ ok: boolean; status: string }>(`/orders/${id}/cancel`, { method: 'PATCH' }),
  rotateToken: (id: string) => request<{ ok: boolean; buyerToken: string }>(`/orders/${id}/rotate-token`, { method: 'PATCH' }),
  setGiftAccess: (id: string, active: boolean) => request<{ ok: boolean; active: boolean }>(`/orders/${id}/gift-access`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  templates: () => request<TemplateAdmin[]>('/templates'),
  updateTemplate: (id: string, data: Record<string, unknown>) => request<{ ok: boolean }>(`/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  audit: () => request<AuditEntry[]>('/audit'),
}

export interface Stats {
  totalOrders: number
  pending: number
  paid: number
  activated: number
  cancelled: number
  totalRevenue: number
  totalGifts: number
  totalPlays: number
}

export interface OrderAdmin {
  id: string
  order_number: string
  buyer_name: string
  buyer_email: string
  price_mxn: number
  status: string
  created_at: string
}

export interface OrderDetail {
  id: string
  order_number: string
  price_mxn: number
  status: string
  payment_date: string | null
  payment_note: string | null
  personalization: Record<string, unknown>
  buyer: { name: string; email: string } | null
  gift: { publicSlug: string; buyerToken: string; playCount: number; active: boolean } | null
  templateName: string
  created_at: string
}

export interface TemplateAdmin {
  id: string
  slug: string
  name: string
  description: string
  price_mxn: number
  active: number
  created_at: string
}

export interface AuditEntry {
  id: string
  action: string
  entity_type: string
  entity_id: string
  details: string | null
  performed_by: string
  created_at: string
}
