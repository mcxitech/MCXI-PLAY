// API regression tests (security + main flows).
// Requires a running server: `npm run build && npx wrangler dev`
// Run: ADMIN_PASSWORD=<local admin password> npm run test:api
// Optional: BASE_URL (default http://localhost:8787)
import { test, before } from 'node:test'
import assert from 'node:assert/strict'

const BASE = process.env.BASE_URL ?? 'http://localhost:8787'
const PASSWORD = process.env.ADMIN_PASSWORD
if (!PASSWORD) throw new Error('Set ADMIN_PASSWORD to the local admin password')

// Each test uses its own fake client IP so rate limits don't interfere (local only:
// in production Cloudflare overwrites CF-Connecting-IP).
const randomIp = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}-${Date.now()}`

async function call(path, { method = 'GET', body, cookie, ip = randomIp() } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': ip,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, data, headers: res.headers }
}

const personalization = (over = {}) => ({
  recipientName: 'Ana', senderName: 'Luis', dedication: 'Te quiero',
  theme: 'romantic', primaryColor: '#e91e63', secondaryColor: '#9c27b0', ...over,
})

async function createOrder(over = {}) {
  const r = await call('/api/orders', {
    method: 'POST',
    body: {
      buyerName: 'Comprador Prueba', buyerEmail: 'prueba@ejemplo.com',
      templateSlug: 'atrapa-mi-corazon', personalization: personalization(), ...over,
    },
  })
  assert.equal(r.status, 201, JSON.stringify(r.data))
  return r.data.orderNumber
}

let admin // session cookie

async function orderId(orderNumber) {
  const r = await call(`/api/admin/orders?q=${orderNumber}`, { cookie: admin })
  return r.data[0].id
}

async function paidOrder(over) {
  const num = await createOrder(over)
  const id = await orderId(num)
  const r = await call(`/api/admin/orders/${id}/pay`, { method: 'PATCH', body: {}, cookie: admin })
  assert.equal(r.status, 200)
  return { num, id }
}

async function activatedOrder(over) {
  const o = await paidOrder(over)
  const r = await call(`/api/admin/orders/${o.id}/activate`, { method: 'PATCH', cookie: admin })
  assert.equal(r.status, 200)
  return { ...o, slug: r.data.publicSlug, token: r.data.buyerToken }
}

before(async () => {
  const r = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD } })
  assert.equal(r.status, 200, 'admin login failed: check ADMIN_PASSWORD')
  admin = r.headers.get('set-cookie').split(';')[0]
})

// ---- Admin authentication (SEC-001) ----

test('forged unsigned session cookie is rejected', async () => {
  const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 1e9 })).toString('base64')
  const r = await call('/api/admin/stats', { cookie: `mcxi_admin_session=${forged}` })
  assert.equal(r.status, 401)
})

test('cookie with tampered payload or fake signature is rejected', async () => {
  const [name, value] = admin.split('=')
  const [, sig] = value.split('.')
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1e12 })).toString('base64url')
  assert.equal((await call('/api/admin/stats', { cookie: `${name}=${payload}.${sig}` })).status, 401)
  assert.equal((await call('/api/admin/stats', { cookie: `${name}=${payload}.AAAA` })).status, 401)
})

test('every admin endpoint requires a session', async () => {
  const endpoints = [
    ['GET', '/api/admin/stats'], ['GET', '/api/admin/orders'], ['GET', '/api/admin/orders/X'],
    ['PATCH', '/api/admin/orders/X/pay'], ['PATCH', '/api/admin/orders/X/activate'],
    ['PATCH', '/api/admin/orders/X/cancel'], ['PATCH', '/api/admin/orders/X/rotate-token'],
    ['PATCH', '/api/admin/orders/X/gift-access'], ['GET', '/api/admin/templates'],
    ['PATCH', '/api/admin/templates/X'], ['GET', '/api/admin/audit'], ['POST', '/api/admin/logout'],
  ]
  for (const [method, path] of endpoints) {
    const body = method === 'GET' ? undefined : {}
    assert.equal((await call(path, { method, body })).status, 401, `${method} ${path}`)
  }
})

test('login is rate limited per IP (SEC-006)', async () => {
  const ip = randomIp()
  for (let i = 0; i < 10; i++) {
    assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'x' }, ip })).status, 401)
  }
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'x' }, ip })).status, 429)
  // Correct password is also blocked from that IP while limited
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, ip })).status, 429)
})

// ---- Orders: validation and public data ----

test('order input is validated and HTML is stripped', async () => {
  const bad = await call('/api/orders', {
    method: 'POST',
    body: { buyerName: 'X', buyerEmail: 'no-email', templateSlug: 'atrapa-mi-corazon', personalization: personalization() },
  })
  assert.equal(bad.status, 422)
  for (const over of [{ theme: 'hacker' }, { primaryColor: 'red;}' }, { recipientName: '' }]) {
    const r = await call('/api/orders', {
      method: 'POST',
      body: { buyerName: 'X', buyerEmail: 'x@x.com', templateSlug: 'atrapa-mi-corazon', personalization: personalization(over) },
    })
    assert.equal(r.status, 422, JSON.stringify(over))
  }
  const o = await activatedOrder({ personalization: personalization({ dedication: 'Hola <script>alert(1)</script><b>!</b>' }) })
  const gift = await call(`/api/gifts/${o.slug}`)
  assert.ok(!gift.data.config.dedication.includes('<'), gift.data.config.dedication)
})

test('order number is long enough and public lookup leaks no secrets (SEC-002/006)', async () => {
  const o = await activatedOrder()
  assert.match(o.num, /^MCXI-\d{8}-[A-Za-z0-9]{8}$/)
  const r = await call(`/api/orders/${o.num}`)
  assert.equal(r.status, 200)
  assert.deepEqual(Object.keys(r.data).sort(), ['createdAt', 'gameName', 'orderNumber', 'priceMxn', 'status'])
  assert.equal((await call('/api/orders/MCXI-20990101-ZZZZZZZZ')).status, 404)
})

test('order creation is rate limited per IP (SEC-006)', async () => {
  const ip = randomIp()
  const body = { buyerName: 'X', buyerEmail: 'x@x.com', templateSlug: 'atrapa-mi-corazon', personalization: personalization() }
  for (let i = 0; i < 10; i++) assert.equal((await call('/api/orders', { method: 'POST', body, ip })).status, 201)
  assert.equal((await call('/api/orders', { method: 'POST', body, ip })).status, 429)
})

test('buyers with the same email stay separate per order (SEC-007)', async () => {
  const a = await createOrder({ buyerName: 'Primera Persona', buyerEmail: 'compartido@ejemplo.com' })
  await createOrder({ buyerName: 'Otra Persona', buyerEmail: 'compartido@ejemplo.com' })
  const detail = await call(`/api/admin/orders/${await orderId(a)}`, { cookie: admin })
  assert.equal(detail.data.buyer.name, 'Primera Persona')
})

// ---- State machine and concurrency (SEC-004/005) ----

test('cannot activate an unpaid order', async () => {
  const id = await orderId(await createOrder())
  assert.equal((await call(`/api/admin/orders/${id}/activate`, { method: 'PATCH', cookie: admin })).status, 400)
  const gift = await call(`/api/admin/orders/${id}`, { cookie: admin })
  assert.equal(gift.data.gift, null)
})

test('concurrent activations create exactly one gift (SEC-005)', async () => {
  const { id } = await paidOrder()
  const results = await Promise.all(
    Array.from({ length: 6 }, () => call(`/api/admin/orders/${id}/activate`, { method: 'PATCH', cookie: admin })),
  )
  const ok = results.filter((r) => r.status === 200)
  assert.equal(ok.length, 1, results.map((r) => r.status).join(','))
  assert.ok(results.every((r) => [200, 400, 409].includes(r.status)))
  const detail = await call(`/api/admin/orders/${id}`, { cookie: admin })
  assert.equal(detail.data.status, 'activated')
  assert.equal(detail.data.gift.publicSlug, ok[0].data.publicSlug)
})

test('concurrent payment confirmations succeed once (SEC-005)', async () => {
  const id = await orderId(await createOrder())
  const results = await Promise.all(
    Array.from({ length: 5 }, () => call(`/api/admin/orders/${id}/pay`, { method: 'PATCH', body: {}, cookie: admin })),
  )
  assert.equal(results.filter((r) => r.status === 200).length, 1, results.map((r) => r.status).join(','))
})

test('activated orders cannot be cancelled; pending can (SEC-004)', async () => {
  const o = await activatedOrder()
  assert.equal((await call(`/api/admin/orders/${o.id}/cancel`, { method: 'PATCH', cookie: admin })).status, 400)
  assert.equal((await call(`/api/gifts/${o.slug}`)).status, 200)
  const pending = await orderId(await createOrder())
  assert.equal((await call(`/api/admin/orders/${pending}/cancel`, { method: 'PATCH', cookie: admin })).status, 200)
})

// ---- Links: separation and revocation ----

test('recipient and buyer links are separate and isolated between orders', async () => {
  const a = await activatedOrder({ personalization: personalization({ recipientName: 'Pedro' }) })
  const b = await activatedOrder({ personalization: personalization({ recipientName: 'Sofia' }) })
  const ga = await call(`/api/gifts/${a.slug}`)
  assert.deepEqual(Object.keys(ga.data).sort(), ['config', 'playCount'])
  assert.equal(ga.data.config.recipientName, 'Pedro')
  assert.equal((await call(`/api/gifts/${b.slug}`)).data.config.recipientName, 'Sofia')
  assert.equal((await call(`/api/gifts/manage/${a.token}`)).data.orderNumber, a.num)
  assert.equal((await call(`/api/gifts/manage/${a.slug}`)).status, 404, 'slug must not work as buyer token')
})

test('rotating the buyer token revokes the old link', async () => {
  const o = await activatedOrder()
  const r = await call(`/api/admin/orders/${o.id}/rotate-token`, { method: 'PATCH', cookie: admin })
  assert.equal(r.status, 200)
  assert.equal((await call(`/api/gifts/manage/${o.token}`)).status, 404)
  assert.equal((await call(`/api/gifts/manage/${r.data.buyerToken}`)).status, 200)
})

test('disabling the recipient link blocks only that gift', async () => {
  const a = await activatedOrder()
  const b = await activatedOrder()
  const off = await call(`/api/admin/orders/${a.id}/gift-access`, { method: 'PATCH', body: { active: false }, cookie: admin })
  assert.equal(off.status, 200)
  assert.equal((await call(`/api/gifts/${a.slug}`)).status, 404)
  assert.equal((await call(`/api/gifts/${b.slug}`)).status, 200)
  assert.equal((await call(`/api/gifts/manage/${a.token}`)).data.active, false)
})

// ---- Static assets ----

test('SPA deep links resolve and export engine is served as JavaScript', async () => {
  for (const path of ['/regalo/x', '/mi-regalo/x', '/pedido/x', '/admin']) {
    const r = await fetch(`${BASE}${path}`, { headers: { Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate' } })
    assert.equal(r.status, 200, path)
  }
  const engine = await fetch(`${BASE}/export-kit/game.js`)
  assert.equal(engine.status, 200)
  assert.match(engine.headers.get('content-type') ?? '', /javascript/)
})
