import { Repo } from '../lib/repo'
import { json, jsonError, readJson } from '../lib/json'
import { validateOrderInput } from '../lib/validate'

export async function handlePublicRoutes(
  request: Request,
  url: URL,
  repo: Repo,
): Promise<Response | null> {
  const { pathname } = url
  const method = request.method

  // GET /api/templates
  if (method === 'GET' && pathname === '/api/templates') {
    const templates = await repo.listActiveTemplates()
    return json(
      templates.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        priceMxn: t.price_mxn,
        gameType: t.game_type,
        defaultConfig: JSON.parse(t.default_config),
      })),
    )
  }

  // GET /api/templates/:slug
  const tplMatch = pathname.match(/^\/api\/templates\/([a-z0-9-]+)$/)
  if (method === 'GET' && tplMatch) {
    const template = await repo.getTemplateBySlug(tplMatch[1]!)
    if (!template || !template.active) return jsonError('Plantilla no encontrada', 404)
    return json({
      slug: template.slug,
      name: template.name,
      description: template.description,
      priceMxn: template.price_mxn,
      gameType: template.game_type,
      defaultConfig: JSON.parse(template.default_config),
    })
  }

  // POST /api/orders
  if (method === 'POST' && pathname === '/api/orders') {
    const body = await readJson(request)
    const result = validateOrderInput(body)
    if (result.errors) return json({ errors: result.errors }, 422)

    const { data } = result
    const template = await repo.getTemplateBySlug(data.templateSlug)
    if (!template || !template.active) return jsonError('Plantilla no encontrada', 404)

    const buyer = await repo.findOrCreateBuyer(data.buyerName, data.buyerEmail)
    const order = await repo.createOrder(buyer.id, template.id, data.personalization, template.price_mxn)

    await repo.auditLog('order.created', 'order', order.id, 'system', {
      orderNumber: order.order_number,
      buyerEmail: data.buyerEmail,
    })

    return json(
      {
        orderNumber: order.order_number,
        status: order.status,
        priceMxn: order.price_mxn,
        createdAt: order.created_at,
      },
      201,
    )
  }

  // GET /api/orders/:orderNumber
  const orderMatch = pathname.match(/^\/api\/orders\/(MCXI-[A-Z0-9-]+)$/i)
  if (method === 'GET' && orderMatch) {
    const order = await repo.getOrderByNumber(orderMatch[1]!)
    if (!order) return jsonError('Pedido no encontrado', 404)

    const template = await repo.getTemplateById(order.template_id)

    const response: Record<string, unknown> = {
      orderNumber: order.order_number,
      status: order.status,
      priceMxn: order.price_mxn,
      gameName: template?.name ?? 'Juego',
      createdAt: order.created_at,
    }

    if (order.status === 'activated') {
      const gift = await repo.getGiftByOrderId(order.id)
      if (gift) {
        response['giftSlug'] = gift.public_slug
        response['buyerToken'] = gift.buyer_token
      }
    }

    return json(response)
  }

  // GET /api/gifts/:publicSlug
  const giftMatch = pathname.match(/^\/api\/gifts\/([a-zA-Z0-9]+)$/)
  if (method === 'GET' && giftMatch && !pathname.includes('/manage/') && !pathname.includes('/export/')) {
    const gift = await repo.getGiftByPublicSlug(giftMatch[1]!)
    if (!gift) return jsonError('Regalo no encontrado', 404)

    await repo.incrementPlayCount(gift.id)

    return json({
      config: JSON.parse(gift.config),
      playCount: gift.play_count + 1,
    })
  }

  // GET /api/gifts/manage/:buyerToken
  const manageMatch = pathname.match(/^\/api\/gifts\/manage\/([a-zA-Z0-9]+)$/)
  if (method === 'GET' && manageMatch) {
    const gift = await repo.getGiftByBuyerToken(manageMatch[1]!)
    if (!gift) return jsonError('Regalo no encontrado', 404)

    const order = await repo.getOrderById(gift.order_id)
    const template = order ? await repo.getTemplateById(order.template_id) : null

    return json({
      publicSlug: gift.public_slug,
      config: JSON.parse(gift.config),
      playCount: gift.play_count,
      active: Boolean(gift.active),
      gameName: template?.name ?? 'Juego',
      orderNumber: order?.order_number,
      createdAt: gift.created_at,
    })
  }

  return null
}
