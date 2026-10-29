import { jsonError } from './json'

// Serves the paid (full-edition) game engine with ONE gift's config baked in.
// The engine lives in static assets under /export-kit/, but direct requests to that path
// are blocked by the Worker (run_worker_first); only this helper reads it, via ASSETS,
// after the caller has checked authorization and that the order is 'activated'.

const ENGINE_PATH = '/export-kit/game.js'
const CONFIG_FIELDS = ['recipientName', 'senderName', 'dedication', 'theme', 'primaryColor', 'secondaryColor'] as const

export async function engineResponse(assets: Fetcher, url: URL, storedConfig: string): Promise<Response> {
  const asset = await assets.fetch(new Request(new URL(ENGINE_PATH, url.origin)))
  if (!asset.ok || !(asset.headers.get('Content-Type') ?? '').includes('javascript')) {
    return jsonError('Motor no disponible', 500)
  }

  // Whitelist fields so nothing else stored with the gift reaches the file
  const parsed = JSON.parse(storedConfig) as Record<string, unknown>
  const config = Object.fromEntries(CONFIG_FIELDS.map((k) => [k, String(parsed[k] ?? '')]))
  // Escape "<" so the JSON can never close a script tag
  const prefix = `window.MCXI_GIFT_CONFIG = ${JSON.stringify(config).replace(/</g, '\\u003c')};\n`

  return new Response(new Blob([prefix, await asset.arrayBuffer()]), {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
