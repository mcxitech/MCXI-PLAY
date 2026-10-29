import { Repo } from '../lib/repo'
import { json, jsonError, readJson } from '../lib/json'
import { verifyPassword, createSessionCookie, clearSessionCookie, isAuthenticated } from '../lib/auth'

export async function handleAdminRoutes(
  request: Request,
  url: URL,
  repo: Repo,
  adminPasswordHash: string | undefined,
  sessionSecret: string | undefined,
): Promise<Response | null> {
  const { pathname } = url
  const method = request.method

  if (!pathname.startsWith('/api/admin/')) return null

  // Fail closed: without both secrets no admin operation is possible
  if (!adminPasswordHash || !sessionSecret || sessionSecret.length < 32) {
    return jsonError('Admin no configurado', 503)
  }

  // CSRF defense in depth (on top of SameSite=Strict): browsers always send Origin on
  // POST/PATCH, so admin mutations must come from this same origin
  if (method !== 'GET' && request.headers.get('Origin') !== url.origin) {
    return jsonError('Origen no permitido', 403)
  }

  // Login — no auth required
  if (method === 'POST' && pathname === '/api/admin/login') {
    // SEC-006: slow down password guessing (counts every attempt, per IP)
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    if (await repo.isRateLimited(`login:${ip}`, 10, 15 * 60)) {
      return jsonError('Demasiados intentos. Espera 15 minutos.', 429)
    }
    const body = (await readJson(request)) as Record<string, unknown> | null
    const password = typeof body?.['password'] === 'string' ? body['password'] : ''
    if (!password) return jsonError('Contraseña requerida', 400)

    const valid = await verifyPassword(password, adminPasswordHash)
    if (!valid) return jsonError('Contraseña incorrecta', 401)

    const secure = url.protocol === 'https:'
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': await createSessionCookie(secure, sessionSecret),
      },
    })
  }

  // All other admin routes require auth
  if (!(await isAuthenticated(request, sessionSecret))) {
    return jsonError('No autorizado', 401)
  }

  // POST /api/admin/logout
  if (method === 'POST' && pathname === '/api/admin/logout') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    })
  }

  // GET /api/admin/stats
  if (method === 'GET' && pathname === '/api/admin/stats') {
    const stats = await repo.getStats()
    return json(stats)
  }

  // GET /api/admin/orders?status=...
  if (method === 'GET' && pathname === '/api/admin/orders') {
    const status = url.searchParams.get('status') || undefined
    const search = url.searchParams.get('q') || undefined
    const orders = await repo.listOrdersAdmin(status, search)
    return json(orders)
  }

  // GET /api/admin/orders/:id
  const orderDetailMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)$/i)
  if (method === 'GET' && orderDetailMatch) {
    const order = await repo.getOrderById(orderDetailMatch[1]!)
    if (!order) return jsonError('Pedido no encontrado', 404)
    const buyer = await repo.getBuyerById(order.buyer_id)
    const gift = await repo.getGiftByOrderId(order.id)
    const template = await repo.getTemplateById(order.template_id)
    return json({
      ...order,
      personalization: JSON.parse(order.personalization),
      buyer: buyer ? { name: buyer.name, email: buyer.email } : null,
      gift: gift ? { publicSlug: gift.public_slug, buyerToken: gift.buyer_token, playCount: gift.play_count, active: Boolean(gift.active), config: JSON.parse(gift.config) } : null,
      templateName: template?.name,
    })
  }

  // PATCH /api/admin/orders/:id/pay
  const payMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)\/pay$/i)
  if (method === 'PATCH' && payMatch) {
    const order = await repo.getOrderById(payMatch[1]!)
    if (!order) return jsonError('Pedido no encontrado', 404)
    if (order.status !== 'pending') return jsonError('Solo se pueden confirmar pedidos pendientes', 400)

    const body = (await readJson(request)) as Record<string, unknown> | null
    const note = typeof body?.['paymentNote'] === 'string' ? body['paymentNote'].slice(0, 200) : undefined

    const changed = await repo.transitionOrder(order.id, ['pending'], 'paid', {
      payment_date: new Date().toISOString(),
      payment_note: note,
    })
    if (!changed) return jsonError('El pedido cambió de estado; recarga la página', 409)
    await repo.auditLog('payment.confirmed', 'order', order.id, 'admin', { note })
    return json({ ok: true, status: 'paid' })
  }

  // PATCH /api/admin/orders/:id/activate
  const activateMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)\/activate$/i)
  if (method === 'PATCH' && activateMatch) {
    const order = await repo.getOrderById(activateMatch[1]!)
    if (!order) return jsonError('Pedido no encontrado', 404)
    if (order.status !== 'paid') return jsonError('Solo se pueden activar pedidos pagados', 400)

    const gift = await repo.activateOrder(order.id)
    if (!gift) return jsonError('El pedido cambió de estado; recarga la página', 409)
    await repo.auditLog('gift.activated', 'order', order.id, 'admin', {
      giftId: gift.id,
      publicSlug: gift.public_slug,
    })
    return json({ ok: true, status: 'activated', publicSlug: gift.public_slug, buyerToken: gift.buyer_token })
  }

  // PATCH /api/admin/orders/:id/cancel
  const cancelMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)\/cancel$/i)
  if (method === 'PATCH' && cancelMatch) {
    const order = await repo.getOrderById(cancelMatch[1]!)
    if (!order) return jsonError('Pedido no encontrado', 404)
    // Only pending/paid orders can be cancelled; activated gifts would stay reachable otherwise
    if (order.status !== 'pending' && order.status !== 'paid') {
      return jsonError('Solo se pueden cancelar pedidos pendientes o pagados', 400)
    }

    const changed = await repo.transitionOrder(order.id, ['pending', 'paid'], 'cancelled')
    if (!changed) return jsonError('El pedido cambió de estado; recarga la página', 409)
    await repo.auditLog('order.cancelled', 'order', order.id, 'admin')
    return json({ ok: true, status: 'cancelled' })
  }

  // PATCH /api/admin/orders/:id/rotate-token — revoke buyer's private link and issue a new one
  const rotateMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)\/rotate-token$/i)
  if (method === 'PATCH' && rotateMatch) {
    const gift = await repo.getGiftByOrderId(rotateMatch[1]!)
    if (!gift) return jsonError('El pedido no tiene regalo activado', 404)
    const buyerToken = await repo.rotateBuyerToken(gift.id)
    await repo.auditLog('gift.token_rotated', 'order', gift.order_id, 'admin')
    return json({ ok: true, buyerToken })
  }

  // PATCH /api/admin/orders/:id/gift-access — enable/disable the recipient's public link
  const accessMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)\/gift-access$/i)
  if (method === 'PATCH' && accessMatch) {
    const gift = await repo.getGiftByOrderId(accessMatch[1]!)
    if (!gift) return jsonError('El pedido no tiene regalo activado', 404)
    const body = (await readJson(request)) as Record<string, unknown> | null
    if (typeof body?.['active'] !== 'boolean') return jsonError('Campo active (boolean) requerido', 400)
    const active = body['active']
    await repo.setGiftActive(gift.id, active)
    await repo.auditLog(active ? 'gift.enabled' : 'gift.disabled', 'order', gift.order_id, 'admin')
    return json({ ok: true, active })
  }

  // GET /api/admin/templates
  if (method === 'GET' && pathname === '/api/admin/templates') {
    const templates = await repo.listAllTemplates()
    return json(templates)
  }

  // PATCH /api/admin/templates/:id
  const tplMatch = pathname.match(/^\/api\/admin\/templates\/([A-Z0-9]+)$/i)
  if (method === 'PATCH' && tplMatch) {
    const template = await repo.getTemplateById(tplMatch[1]!)
    if (!template) return jsonError('Plantilla no encontrada', 404)

    const body = (await readJson(request)) as Record<string, unknown> | null
    if (!body) return jsonError('Body requerido', 400)

    const updates: Record<string, unknown> = {}
    if (typeof body['price_mxn'] === 'number' && body['price_mxn'] > 0) updates['price_mxn'] = body['price_mxn']
    if (typeof body['active'] === 'number' && (body['active'] === 0 || body['active'] === 1)) updates['active'] = body['active']
    if (typeof body['name'] === 'string' && body['name'].length > 0) updates['name'] = body['name'].slice(0, 100)
    if (typeof body['description'] === 'string' && body['description'].length > 0) updates['description'] = body['description'].slice(0, 500)

    if (Object.keys(updates).length === 0) return jsonError('Sin cambios válidos', 400)

    await repo.updateTemplate(template.id, updates)
    await repo.auditLog('template.updated', 'template', template.id, 'admin', updates)
    return json({ ok: true })
  }

  // GET /api/admin/audit
  if (method === 'GET' && pathname === '/api/admin/audit') {
    const logs = await repo.listAuditLog(50)
    return json(logs)
  }

  return null
}
