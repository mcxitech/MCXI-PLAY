import { Repo } from './lib/repo'
import { jsonError } from './lib/json'
import { handlePublicRoutes } from './routes/public'
import { handleAdminRoutes } from './routes/admin'

export interface Env {
  DB: D1Database
  ADMIN_PASSWORD_HASH?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404 })
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    try {
      const repo = new Repo(env.DB)

      const publicResponse = await handlePublicRoutes(request, url, repo)
      if (publicResponse) return publicResponse

      const adminResponse = await handleAdminRoutes(request, url, repo, env.ADMIN_PASSWORD_HASH)
      if (adminResponse) return adminResponse

      return jsonError('Ruta no encontrada', 404)
    } catch (err) {
      console.error('Worker error:', err)
      return jsonError('Error interno del servidor', 500)
    }
  },
} satisfies ExportedHandler<Env>
