import { ulid, generateOrderNumber, generatePublicSlug, generateBuyerToken } from './ulid'
import type { PersonalizationInput } from './validate'

export interface Template {
  id: string
  slug: string
  name: string
  description: string
  price_mxn: number
  active: number
  game_type: string
  default_config: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  template_id: string
  personalization: string
  price_mxn: number
  status: string
  payment_date: string | null
  payment_note: string | null
  created_at: string
  updated_at: string
}

export interface Gift {
  id: string
  order_id: string
  public_slug: string
  buyer_token: string
  config: string
  active: number
  play_count: number
  created_at: string
  updated_at: string
}

export interface Buyer {
  id: string
  name: string
  email: string
  created_at: string
}

export class Repo {
  private db: D1Database
  constructor(db: D1Database) {
    this.db = db
  }

  async listActiveTemplates(): Promise<Template[]> {
    const r = await this.db.prepare('SELECT * FROM templates WHERE active = 1 ORDER BY created_at').all<Template>()
    return r.results
  }

  async getTemplateBySlug(slug: string): Promise<Template | null> {
    return this.db.prepare('SELECT * FROM templates WHERE slug = ?').bind(slug).first<Template>()
  }

  async getTemplateById(id: string): Promise<Template | null> {
    return this.db.prepare('SELECT * FROM templates WHERE id = ?').bind(id).first<Template>()
  }

  async findOrCreateBuyer(name: string, email: string): Promise<Buyer> {
    const existing = await this.db.prepare('SELECT * FROM buyers WHERE email = ? LIMIT 1').bind(email).first<Buyer>()
    if (existing) {
      if (existing.name !== name) {
        await this.db.prepare('UPDATE buyers SET name = ? WHERE id = ?').bind(name, existing.id).run()
        existing.name = name
      }
      return existing
    }
    const id = ulid()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO buyers (id, name, email, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, name, email, now)
      .run()
    return { id, name, email, created_at: now }
  }

  async createOrder(
    buyerId: string,
    templateId: string,
    personalization: PersonalizationInput,
    priceMxn: number,
  ): Promise<Order> {
    const id = ulid()
    const orderNumber = generateOrderNumber()
    const now = new Date().toISOString()
    const persJson = JSON.stringify(personalization)

    await this.db
      .prepare(
        `INSERT INTO orders (id, order_number, buyer_id, template_id, personalization, price_mxn, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      )
      .bind(id, orderNumber, buyerId, templateId, persJson, priceMxn, now, now)
      .run()

    return {
      id, order_number: orderNumber, buyer_id: buyerId, template_id: templateId,
      personalization: persJson, price_mxn: priceMxn, status: 'pending',
      payment_date: null, payment_note: null, created_at: now, updated_at: now,
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.db.prepare('SELECT * FROM orders WHERE order_number = ?').bind(orderNumber).first<Order>()
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Order>()
  }

  async listOrders(status?: string): Promise<Order[]> {
    if (status) {
      const r = await this.db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').bind(status).all<Order>()
      return r.results
    }
    const r = await this.db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all<Order>()
    return r.results
  }

  async updateOrderStatus(id: string, status: string, extra?: { payment_date?: string; payment_note?: string }): Promise<void> {
    const now = new Date().toISOString()
    await this.db
      .prepare('UPDATE orders SET status = ?, payment_date = COALESCE(?, payment_date), payment_note = COALESCE(?, payment_note), updated_at = ? WHERE id = ?')
      .bind(status, extra?.payment_date ?? null, extra?.payment_note ?? null, now, id)
      .run()
  }

  async createGift(orderId: string, config: PersonalizationInput): Promise<Gift> {
    const id = ulid()
    const publicSlug = generatePublicSlug()
    const buyerToken = generateBuyerToken()
    const now = new Date().toISOString()
    const configJson = JSON.stringify(config)

    await this.db
      .prepare(
        `INSERT INTO gifts (id, order_id, public_slug, buyer_token, config, active, play_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)`,
      )
      .bind(id, orderId, publicSlug, buyerToken, configJson, now, now)
      .run()

    return {
      id, order_id: orderId, public_slug: publicSlug, buyer_token: buyerToken,
      config: configJson, active: 1, play_count: 0, created_at: now, updated_at: now,
    }
  }

  async getGiftByPublicSlug(slug: string): Promise<Gift | null> {
    return this.db.prepare('SELECT * FROM gifts WHERE public_slug = ? AND active = 1').bind(slug).first<Gift>()
  }

  async getGiftByBuyerToken(token: string): Promise<Gift | null> {
    return this.db.prepare('SELECT * FROM gifts WHERE buyer_token = ?').bind(token).first<Gift>()
  }

  async getGiftByOrderId(orderId: string): Promise<Gift | null> {
    return this.db.prepare('SELECT * FROM gifts WHERE order_id = ?').bind(orderId).first<Gift>()
  }

  // Revokes the buyer's private link by replacing the token; the old URL stops working
  async rotateBuyerToken(giftId: string): Promise<string> {
    const token = generateBuyerToken()
    await this.db.prepare('UPDATE gifts SET buyer_token = ?, updated_at = ? WHERE id = ?')
      .bind(token, new Date().toISOString(), giftId).run()
    return token
  }

  async setGiftActive(giftId: string, active: boolean): Promise<void> {
    await this.db.prepare('UPDATE gifts SET active = ?, updated_at = ? WHERE id = ?')
      .bind(active ? 1 : 0, new Date().toISOString(), giftId).run()
  }

  async incrementPlayCount(giftId: string): Promise<void> {
    await this.db.prepare('UPDATE gifts SET play_count = play_count + 1, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), giftId).run()
  }

  async auditLog(action: string, entityType: string, entityId: string, performedBy: string, details?: unknown): Promise<void> {
    const id = ulid()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO audit_log (id, action, entity_type, entity_id, details, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, action, entityType, entityId, details ? JSON.stringify(details) : null, performedBy, now)
      .run()
  }

  async getStats(): Promise<{ totalOrders: number; pending: number; paid: number; activated: number; cancelled: number; totalRevenue: number; totalGifts: number; totalPlays: number }> {
    const orders = await this.db.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'activated' THEN 1 ELSE 0 END) as activated,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status IN ('paid','activated') THEN price_mxn ELSE 0 END) as revenue
      FROM orders`
    ).first<{ total: number; pending: number; paid: number; activated: number; cancelled: number; revenue: number }>()

    const gifts = await this.db.prepare(
      'SELECT COUNT(*) as total, SUM(play_count) as plays FROM gifts'
    ).first<{ total: number; plays: number }>()

    return {
      totalOrders: orders?.total ?? 0,
      pending: orders?.pending ?? 0,
      paid: orders?.paid ?? 0,
      activated: orders?.activated ?? 0,
      cancelled: orders?.cancelled ?? 0,
      totalRevenue: orders?.revenue ?? 0,
      totalGifts: gifts?.total ?? 0,
      totalPlays: gifts?.plays ?? 0,
    }
  }

  async listOrdersAdmin(status?: string, search?: string): Promise<Order[]> {
    let sql = 'SELECT o.*, b.name as buyer_name, b.email as buyer_email FROM orders o JOIN buyers b ON o.buyer_id = b.id'
    const conditions: string[] = []
    const bindings: string[] = []

    if (status) {
      conditions.push('o.status = ?')
      bindings.push(status)
    }
    if (search) {
      conditions.push('(o.order_number LIKE ? OR b.name LIKE ? OR b.email LIKE ?)')
      const like = `%${search}%`
      bindings.push(like, like, like)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    sql += ' ORDER BY o.created_at DESC LIMIT 100'

    const stmt = this.db.prepare(sql)
    const r = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all<Order>()
    return r.results
  }

  async getBuyerById(id: string): Promise<Buyer | null> {
    return this.db.prepare('SELECT * FROM buyers WHERE id = ?').bind(id).first<Buyer>()
  }

  async listAllTemplates(): Promise<Template[]> {
    const r = await this.db.prepare('SELECT * FROM templates ORDER BY created_at').all<Template>()
    return r.results
  }

  async updateTemplate(id: string, updates: Record<string, unknown>): Promise<void> {
    const sets: string[] = []
    const vals: unknown[] = []
    for (const [key, val] of Object.entries(updates)) {
      if (['price_mxn', 'active', 'name', 'description'].includes(key)) {
        sets.push(`${key} = ?`)
        vals.push(val)
      }
    }
    if (sets.length === 0) return
    sets.push('updated_at = ?')
    vals.push(new Date().toISOString())
    vals.push(id)
    await this.db.prepare(`UPDATE templates SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  }

  async listAuditLog(limit: number): Promise<unknown[]> {
    const r = await this.db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').bind(limit).all()
    return r.results
  }
}
