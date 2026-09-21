import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import { readFileSync } from 'node:fs'
import { generateKeyPair, exportSPKI, SignJWT } from 'jose'
import handler from './index'
import { verifySignature } from './billing'

let mf: Miniflare, env: Env, tokenA: string, tokenB: string, wrongOriginToken: string, expiredToken: string
const origin = 'https://flow.example.com'
const draft = { title: 'Private research', notes: 'Owner only', networks: ['swift'], locale: 'en' }
async function request(path: string, method = 'GET', token = tokenA, body?: unknown, revision?: number) {
  return handler.fetch(new Request(origin + path, { method, headers: { Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(revision === undefined ? {} : { 'If-Match': String(revision) }) }, body: body ? JSON.stringify(body) : undefined }), env)
}
async function grant(userId = 'user_a', id = 'sub_a', until = Date.now() + 86400000) {
  await env.DB.prepare('INSERT INTO subscriptions (id,user_id,customer_id,environment,product_id,status,paid_until,event_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, userId, 'cust_a', 'test', 'prod_flow', 'active', until, Date.now()).run()
}
async function sign(raw: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CREEM_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)))].map(b => b.toString(16).padStart(2, '0')).join('')
}
async function event(type: string, payload: Record<string, unknown>, id = crypto.randomUUID()) {
  const raw = JSON.stringify({ id, eventType: type, created_at: Date.now(), object: payload })
  return handler.fetch(new Request(origin + '/api/webhooks/creem', { method: 'POST', headers: { 'creem-signature': await sign(raw) }, body: raw }), env)
}
const currentSubscription = () => ({ id: 'sub_a', mode: 'test', product: 'prod_flow', customer: 'cust_a', status: 'active', updated_at: new Date().toISOString(), metadata: { app: 'fin-flow', userId: 'user_a', attemptId: 'attempt_a' } })
beforeAll(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', compatibilityDate: '2026-09-21', d1Databases: ['DB'] }))
  const db = await mf.getD1Database('DB')
  // D1 executes real SQLite statements, including unique indexes and batch transactions.
  for (const sql of readFileSync('worker/migrations/0001_workspace.sql', 'utf8').split(';').filter(s => s.trim())) await db.prepare(sql).run()
  const keys = await generateKeyPair('RS256')
  const mint = (sub: string, azp = origin, exp = Math.floor(Date.now() / 1000) + 3600) => new SignJWT({ azp, sid: 'sess_test' }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setSubject(sub).setIssuer('https://clerk.example.com').setIssuedAt().setExpirationTime(exp).sign(keys.privateKey)
  env = { DB: db, ASSETS: { fetch: async () => new Response('static'), connect: () => { throw new Error('Not used') } }, APP_ORIGIN: origin, CLERK_JWT_KEY: await exportSPKI(keys.publicKey), CLERK_ISSUER: 'https://clerk.example.com', CLERK_FRONTEND_ORIGIN: '', CREEM_API_KEY: 'test-key', CREEM_WEBHOOK_SECRET: 'test-secret', CREEM_PRODUCT_ID: 'prod_flow', CREEM_ENVIRONMENT: 'test', BILLING_ACQUISITION_ENABLED: 'false' }
  ;[tokenA, tokenB, wrongOriginToken, expiredToken] = await Promise.all([mint('user_a'), mint('user_b'), mint('user_a', 'https://other.example.com'), mint('user_a', origin, 1)])
})
beforeEach(async () => {
  vi.restoreAllMocks()
  env.BILLING_ACQUISITION_ENABLED = 'false'
  await env.DB.batch(['briefs', 'subscriptions', 'checkout_attempts', 'billing_events'].map(table => env.DB.prepare(`DELETE FROM ${table}`)))
})
afterAll(async () => { await mf?.dispose() })

describe('authenticated workspace with real D1 and signed Clerk-format JWTs', () => {
  it('rejects unsigned, expired and wrong-origin tokens', async () => {
    for (const token of ['forged', wrongOriginToken, expiredToken]) expect((await request('/api/account', 'GET', token)).status).toBe(401)
    expect((await request('/api/account')).status).toBe(200)
  })
  it('blocks free saves, cross-owner reads/writes/deletes and preserves expired export access', async () => {
    expect((await request('/api/briefs/brief-a', 'PUT', tokenA, draft)).status).toBe(403)
    await grant()
    expect((await request('/api/briefs/brief-a', 'PUT', tokenA, draft)).status).toBe(200)
    expect(await (await request('/api/briefs', 'GET', tokenB)).json()).toEqual({ briefs: [] })
    await grant('user_b', 'sub_b')
    expect((await request('/api/briefs/brief-a', 'PUT', tokenB, draft)).status).toBe(409)
    expect((await request('/api/briefs/brief-a', 'DELETE', tokenB)).status).toBe(404)
    await env.DB.prepare('UPDATE subscriptions SET paid_until = 1').run()
    expect((await request('/api/briefs/brief-a', 'PUT', tokenA, draft)).status).toBe(403)
    const result = await (await request('/api/briefs')).json() as { briefs: { markdown: string }[] }
    expect(result.briefs[0].markdown).toContain('Owner only')
    expect((await request('/api/briefs/brief-a', 'DELETE')).status).toBe(200)
  })
  it('enforces the 50-document limit while allowing updates and rejects cross-origin writes', async () => {
    await grant()
    await env.DB.batch(Array.from({ length: 50 }, (_, i) => env.DB.prepare('INSERT INTO briefs VALUES (?,?,?,?)').bind(`brief-${i}`, 'user_a', '{}', Date.now())))
    expect((await request('/api/briefs/overflow', 'PUT', tokenA, draft)).status).toBe(409)
    const row = await env.DB.prepare('SELECT updated_at FROM briefs WHERE id = ?').bind('brief-0').first<{ updated_at: number }>()
    expect((await request('/api/briefs/brief-0', 'PUT', tokenA, draft, row!.updated_at)).status).toBe(200)
    const response = await handler.fetch(new Request(origin + '/api/briefs/brief-0', { method: 'DELETE', headers: { Authorization: `Bearer ${tokenA}`, Origin: 'https://evil.example' } }), env)
    expect(response.status).toBe(403)
  })
  it('rejects stale edits and deleted-document resurrection while making save retries idempotent', async () => {
    await grant()
    const first = await (await request('/api/briefs/versioned', 'PUT', tokenA, draft)).json() as { brief: { updatedAt: number } }
    const edit = { ...draft, notes: 'Latest edit from another device' }
    const second = await request('/api/briefs/versioned', 'PUT', tokenA, edit, first.brief.updatedAt)
    expect(second.status).toBe(200)
    expect((await request('/api/briefs/versioned', 'PUT', tokenA, { ...draft, notes: 'Stale overwrite' }, first.brief.updatedAt)).status).toBe(409)
    expect((await request('/api/briefs/versioned', 'PUT', tokenA, edit, first.brief.updatedAt)).status).toBe(200)
    const stored = await (await request('/api/briefs')).json() as { briefs: { draft: typeof draft }[] }
    expect(stored.briefs[0].draft.notes).toBe(edit.notes)
    await request('/api/briefs/versioned', 'DELETE')
    expect((await request('/api/briefs/versioned', 'PUT', tokenA, draft, first.brief.updatedAt)).status).toBe(409)
  })
  it('rejects writes when the client account changes during token retrieval', async () => {
    await grant('user_b', 'sub_b')
    const response = await handler.fetch(new Request(origin + '/api/briefs/switched', { method: 'PUT', headers: { Origin: origin, Authorization: `Bearer ${tokenB}`, 'X-Expected-User': 'user_a', 'Content-Type': 'application/json' }, body: JSON.stringify(draft) }), env)
    expect(response.status).toBe(401)
    expect(await (await request('/api/briefs', 'GET', tokenB)).json()).toEqual({ briefs: [] })
  })
  it('never upgrades from checkout return parameters and keeps acquisition closed', async () => {
    const result = await (await request('/api/account?checkout=success&pro=true')).json() as { pro: boolean }
    expect(result.pro).toBe(false)
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en' })).status).toBe(503)
  })
})

describe('Creem isolation, lifecycle and checkout recovery', () => {
  it('rejects bad signatures including body tampering', async () => {
    expect(await verifySignature('body', await sign('body'), env.CREEM_WEBHOOK_SECRET)).toBe(true)
    expect(await verifySignature('changed', await sign('body'), env.CREEM_WEBHOOK_SECRET)).toBe(false)
    expect(await verifySignature('body', 'bad', env.CREEM_WEBHOOK_SECRET)).toBe(false)
    expect((await handler.fetch(new Request(origin + '/api/webhooks/creem', { method: 'POST', body: '{}' }), env)).status).toBe(401)
  })
  it('accepts paid evidence only for a server-owned attempt; duplicate events do not duplicate grants', async () => {
    await env.DB.prepare('INSERT INTO checkout_attempts (id,user_id,environment,product_id,created_at) VALUES (?,?,?,?,?)').bind('attempt_a', 'user_a', 'test', 'prod_flow', Date.now()).run()
    const current = currentSubscription()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json(current))
    const payload = { ...current, current_period_end_date: new Date(Date.now() + 86400000).toISOString() }
    expect((await event('subscription.paid', payload, 'evt_paid')).status).toBe(200)
    expect((await event('subscription.paid', payload, 'evt_paid')).status).toBe(200)
    expect((await (await request('/api/account')).json() as { pro: boolean }).pro).toBe(true)
    expect((await env.DB.prepare('SELECT COUNT(*) AS total FROM subscriptions').first<{ total: number }>())?.total).toBe(1)
    current.status = 'canceled'; current.updated_at = new Date(Date.now() + 1000).toISOString()
    expect((await event('subscription.canceled', current)).status).toBe(200)
    expect((await (await request('/api/account')).json() as { pro: boolean }).pro).toBe(true)
    current.status = 'expired'; current.updated_at = new Date(Date.now() + 2000).toISOString()
    await event('subscription.expired', current)
    // Late payment cannot undo the current expired status.
    await event('subscription.paid', payload)
    expect((await (await request('/api/account')).json() as { pro: boolean }).pro).toBe(false)
  })
  it('retains refund/dispute blocks through late paid events and rejects other product/environment', async () => {
    await grant()
    const current = currentSubscription()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json(current))
    await event('refund.created', { subscription: 'sub_a' })
    await event('subscription.paid', { ...current, current_period_end_date: new Date(Date.now() + 86400000).toISOString() })
    expect((await (await request('/api/account')).json() as { pro: boolean }).pro).toBe(false)
    current.mode = 'prod'
    expect((await event('subscription.paid', current)).status).toBe(400)
    current.mode = 'test'; current.product = 'prod_memostem'
    expect(await (await event('subscription.paid', current)).json()).toMatchObject({ ignored: true })
  })
  it('creates one server-priced checkout and reuses it; the portal uses only a verified customer', async () => {
    env.BILLING_ACQUISITION_ENABLED = 'true'
    const product = { id: 'prod_flow', price: 4900, currency: 'USD', billing_type: 'recurring', billing_period: 'every-year', tax_mode: 'inclusive', status: 'active' }
    let checkoutResult: Record<string, unknown> = {}
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const path = String(url)
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      if (path.includes('/products?')) return Response.json(product)
      if (path.endsWith('/customers/billing')) { expect(body).toEqual({ customer_id: 'cust_a' }); return Response.json({ customer_portal_link: 'https://www.creem.io/my-orders/customer' }) }
      if (init?.method === 'POST') {
        expect(body.product_id).toBe('prod_flow')
        expect(body.units).toBe(1)
        expect(body.metadata.userId).toBe('user_a')
        checkoutResult = { id: 'ch_a', mode: 'test', product: 'prod_flow', request_id: body.request_id, status: 'pending', checkout_url: 'https://www.creem.io/test/payment/ch_a' }
      }
      return Response.json(checkoutResult)
    })
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en', product_id: 'prod_memostem', userId: 'user_b' })).status).toBe(200)
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en' })).status).toBe(200)
    expect(mock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1)
    expect((await request('/api/billing/portal', 'POST', tokenA, { customer_id: 'cust_other' })).status).toBe(404)
    await grant()
    expect((await request('/api/billing/portal', 'POST', tokenA, { customer_id: 'cust_other' })).status).toBe(200)
  })
  it('rejects a mispriced product before creating a payable checkout', async () => {
    env.BILLING_ACQUISITION_ENABLED = 'true'
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 'prod_flow', price: 1000, currency: 'USD', billing_type: 'recurring', billing_period: 'every-year', tax_mode: 'inclusive', status: 'active' }))
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en' })).status).toBe(503)
    expect(mock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0)
  })
  it('keeps an uncertain checkout fenced and never sends a second provider POST', async () => {
    env.BILLING_ACQUISITION_ENABLED = 'true'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      if (init?.method === 'POST') throw new Error('timeout')
      return Response.json({ id: 'prod_flow', price: 4900, currency: 'USD', billing_type: 'recurring', billing_period: 'every-year', tax_mode: 'inclusive', status: 'active' })
    })
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en' })).status).toBe(503)
    expect((await request('/api/billing/checkout', 'POST', tokenA, { locale: 'en' })).status).toBe(409)
    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1)
  })
})
