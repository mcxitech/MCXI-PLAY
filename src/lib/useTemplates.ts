import { useEffect, useState } from 'react'
import { GAME_TEMPLATES, type GameTemplate } from '@/lib/constants'

// Catalog data editable from the admin (name, description, price, active) comes from D1.
// Static entries in constants.ts keep only presentation data (image, tags, short text).
// Orders are always charged the D1 price, so the site must show that same price.

interface ApiTemplate {
  slug: string
  name: string
  description: string
  priceMxn: number // centavos
}

let cache: Promise<ApiTemplate[]> | null = null

function loadTemplates(): Promise<ApiTemplate[]> {
  cache ??= fetch('/api/templates')
    .then((r) => (r.ok ? (r.json() as Promise<ApiTemplate[]>) : Promise.reject(new Error(String(r.status)))))
    .catch((err: unknown) => {
      cache = null // retry on next mount
      throw err
    })
  return cache
}

function merge(api: ApiTemplate[]): GameTemplate[] {
  return GAME_TEMPLATES.flatMap((g) => {
    const t = api.find((a) => a.slug === g.slug)
    // Not returned by the API = deactivated in the admin
    if (!t) return []
    return [{ ...g, name: t.name, description: t.description, priceMxn: t.priceMxn / 100 }]
  })
}

export function useTemplates(): { templates: GameTemplate[]; loading: boolean; error: boolean } {
  const [state, setState] = useState<{ templates: GameTemplate[]; loading: boolean; error: boolean }>({
    templates: [],
    loading: true,
    error: false,
  })

  useEffect(() => {
    let alive = true
    loadTemplates()
      .then((api) => alive && setState({ templates: merge(api), loading: false, error: false }))
      .catch(() => alive && setState({ templates: [], loading: false, error: true }))
    return () => {
      alive = false
    }
  }, [])

  return state
}
