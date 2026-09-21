import { PRO_PRICE_USD } from '../src/briefs'
import { boundedText, HttpError, idOf, json, object } from './http'

interface Subscription { id: string; user_id: string; customer_id: string; status: string; paid_until: number; blocked: number; environment: string; product_id: string }
interface Attempt { id: string; user_id: string; product_id: string; checkout_id: string | null; checkout_url: string | null }
export function billingConfigured(env: Env) {
  return Boolean(env.CREEM_API_KEY && env.CREEM_WEBHOOK_SECRET && env.CREEM_PRODUCT_ID && ['test', 'production'].includes(env.CREEM_ENVIRONMENT))
}
export const acquisitionEnabled = (env: Env) => billingConfigured(env) && env.BILLING_ACQUISITION_ENABLED === 'true'
export async function subscriptions(env: Env, userId: string) {
  const rows = await env.DB.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND environment = ? AND product_id = ?').bind(userId, env.CREEM_ENVIRONMENT, env.CREEM_PRODUCT_ID).all<Subscription>()
  return rows.results
}
export const hasAccess = (rows: Subscription[], now = Date.now()) => rows.some(s => !s.blocked && ['active', 'scheduled_cancel', 'canceled'].includes(s.status) && s.paid_until > now)
function modeMatches(value: unknown, env: Env) {
  return (env.CREEM_ENVIRONMENT === 'production' ? ['prod', 'production'] : ['test', 'sandbox']).includes(String(value))
}
export function hostedUrl(value: unknown): string {
  if (typeof value !== 'string') throw new HttpError(502, 'provider_response_invalid')
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || !(url.hostname === 'creem.io' || url.hostname.endsWith('.creem.io'))) throw new HttpError(502, 'provider_response_invalid')
  return url.href
}
async function creem(env: Env, path: string, body?: Record<string, unknown>) {
  if (!billingConfigured(env)) throw new HttpError(503, 'billing_unavailable')
  const base = env.CREEM_ENVIRONMENT === 'production' ? 'https://api.creem.io/v1' : 'https://test-api.creem.io/v1'
  const response = await fetch(base + path, { method: body ? 'POST' : 'GET', headers: { 'x-api-key': env.CREEM_API_KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000) })
  if (!response.ok) { await response.body?.cancel(); throw new HttpError(502, 'provider_unavailable') }
  return object(JSON.parse(await boundedText(response.body, 1048576)))
}
export function validProduct(product: Record<string, unknown>, env: Env) {
  return product.id === env.CREEM_PRODUCT_ID && product.price === PRO_PRICE_USD * 100 && product.currency === 'USD' && product.billing_type === 'recurring' && product.billing_period === 'every-year' && product.tax_mode === 'inclusive' && product.status === 'active'
}
export async function checkout(env: Env, userId: string, locale: 'ko' | 'en') {
  if (!acquisitionEnabled(env)) throw new HttpError(503, 'billing_unavailable')
  const rows = await subscriptions(env, userId)
  // An uncertain renewal or refund must be reconciled before a second subscription.
  if (rows.some(s => s.blocked || !['canceled', 'expired'].includes(s.status) || s.paid_until > Date.now())) throw new HttpError(409, 'subscription_exists')
  const pending = await env.DB.prepare("SELECT * FROM checkout_attempts WHERE user_id = ? AND environment = ? AND state = 'pending'").bind(userId, env.CREEM_ENVIRONMENT).first<Attempt>()
  if (pending) {
    if (!pending.checkout_id) throw new HttpError(409, 'checkout_pending')
    const current = await creem(env, `/checkouts?checkout_id=${encodeURIComponent(pending.checkout_id)}`)
    if (current.id !== pending.checkout_id || current.request_id !== pending.id || idOf(current.product) !== pending.product_id || !modeMatches(current.mode, env)) throw new HttpError(502, 'provider_response_invalid')
    if (current.status === 'pending') return json({ url: hostedUrl(current.checkout_url) })
    if (current.status !== 'expired') throw new HttpError(409, 'checkout_pending')
    await env.DB.prepare("UPDATE checkout_attempts SET state = 'expired' WHERE id = ? AND state = 'pending'").bind(pending.id).run()
  }
  const product = await creem(env, `/products?product_id=${encodeURIComponent(env.CREEM_PRODUCT_ID)}`)
  if (!validProduct(product, env)) throw new HttpError(503, 'product_not_ready')
  const attemptId = crypto.randomUUID()
  try {
    await env.DB.prepare('INSERT INTO checkout_attempts (id,user_id,environment,product_id,created_at) VALUES (?,?,?,?,?)').bind(attemptId, userId, env.CREEM_ENVIRONMENT, env.CREEM_PRODUCT_ID, Date.now()).run()
  } catch { throw new HttpError(409, 'checkout_pending') }
  // Preserve the pending row on timeout, malformed response or provider rejection.
  // A second POST could create a second payable checkout; an operator must reconcile.
  const result = await creem(env, '/checkouts', { product_id: env.CREEM_PRODUCT_ID, request_id: attemptId, units: 1, success_url: `${env.APP_ORIGIN}/${locale}/workspace?checkout=returned`, metadata: { app: 'fin-flow', userId, attemptId } })
  if (!idOf(result) || result.request_id !== attemptId || idOf(result.product) !== env.CREEM_PRODUCT_ID || !modeMatches(result.mode, env)) throw new HttpError(502, 'provider_response_invalid')
  const url = hostedUrl(result.checkout_url)
  await env.DB.prepare('UPDATE checkout_attempts SET checkout_id = ?, checkout_url = ? WHERE id = ?').bind(result.id, url, attemptId).run()
  return json({ url })
}
export async function portal(env: Env, userId: string) {
  const rows = await subscriptions(env, userId)
  if (!rows.length) throw new HttpError(404, 'subscription_missing')
  const response = await creem(env, '/customers/billing', { customer_id: rows[0].customer_id })
  return json({ url: hostedUrl(response.customer_portal_link) })
}
export async function verifySignature(raw: string, signature: string, secret: string) {
  if (!/^[a-f\d]{64}$/i.test(signature) || !secret) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const bytes = Uint8Array.from(signature.match(/../g)!, pair => parseInt(pair, 16))
  return crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(raw))
}
export async function webhook(request: Request, env: Env) {
  if (!billingConfigured(env)) throw new HttpError(503, 'billing_unavailable')
  const raw = await boundedText(request.body)
  if (!await verifySignature(raw, request.headers.get('creem-signature') ?? '', env.CREEM_WEBHOOK_SECRET)) throw new HttpError(401, 'invalid_signature')
  let event: Record<string, unknown>
  try { event = object(JSON.parse(raw)) } catch { throw new HttpError(400, 'invalid_json') }
  const type = String(event.eventType), eventId = idOf(event), at = Number(event.created_at)
  if (!eventId || !Number.isSafeInteger(at) || at <= 0 || at > Date.now() + 300000) throw new HttpError(400, 'invalid_event')
  if (await env.DB.prepare('SELECT id FROM billing_events WHERE id = ?').bind(eventId).first()) return json({ received: true })
  const payload = object(event.object)
  const isCheckout = type === 'checkout.completed'
  const blocked = type === 'refund.created' || type === 'dispute.created'
  if (!isCheckout && !blocked && !type.startsWith('subscription.')) return json({ received: true, ignored: true })
  const subscriptionId = isCheckout || blocked ? idOf(payload.subscription) : idOf(payload)
  if (!subscriptionId) throw new HttpError(400, 'invalid_event')
  // Reconcile the current provider resource; redirects/client assertions never grant access.
  const current = await creem(env, `/subscriptions?subscription_id=${encodeURIComponent(subscriptionId)}`)
  if (idOf(current.product) !== env.CREEM_PRODUCT_ID) return json({ received: true, ignored: true })
  if (current.id !== subscriptionId || !modeMatches(current.mode, env) || !idOf(current.customer)) throw new HttpError(400, 'invalid_subscription')
  const existing = await env.DB.prepare('SELECT * FROM subscriptions WHERE id = ?').bind(subscriptionId).first<Subscription>()
  const metadata = isCheckout ? object(payload.metadata) : object(current.metadata)
  const attempt = await env.DB.prepare('SELECT * FROM checkout_attempts WHERE id = ? AND environment = ? AND product_id = ?').bind(String(metadata.attemptId ?? ''), env.CREEM_ENVIRONMENT, env.CREEM_PRODUCT_ID).first<Attempt>()
  const userId = existing?.user_id ?? attempt?.user_id
  if (!userId || (!existing && (metadata.app !== 'fin-flow' || metadata.userId !== userId))) throw new HttpError(503, 'checkout_link_pending')
  if (existing && (existing.customer_id !== idOf(current.customer) || existing.environment !== env.CREEM_ENVIRONMENT || existing.product_id !== env.CREEM_PRODUCT_ID)) throw new HttpError(400, 'owner_mismatch')
  if (isCheckout && (!attempt || payload.request_id !== attempt.id || (attempt.checkout_id && payload.id !== attempt.checkout_id) || payload.status !== 'completed' || !modeMatches(payload.mode, env) || idOf(payload.product) !== env.CREEM_PRODUCT_ID || idOf(payload.customer) !== idOf(current.customer))) throw new HttpError(400, 'checkout_mismatch')
  const status = String(current.status)
  if (!['active', 'scheduled_cancel', 'canceled', 'expired', 'past_due', 'unpaid', 'paused', 'trialing'].includes(status)) throw new HttpError(503, 'unknown_subscription_status')
  let paidUntil = 0
  if (type === 'subscription.paid') {
    if (idOf(payload.product) !== env.CREEM_PRODUCT_ID || idOf(payload.customer) !== idOf(current.customer) || !modeMatches(payload.mode, env)) throw new HttpError(400, 'payment_mismatch')
    paidUntil = Date.parse(String(payload.current_period_end_date))
    if (!Number.isFinite(paidUntil)) throw new HttpError(400, 'invalid_paid_period')
  }
  const updated = Date.parse(String(current.updated_at))
  if (!Number.isFinite(updated)) throw new HttpError(503, 'provider_clock_missing')
  // Separate paid-through evidence from status clocks: a late paid event must not
  // undo expiration/refund, but may prove a period on an already canceled plan.
  const statements = [env.DB.prepare(`INSERT INTO subscriptions (id,user_id,customer_id,environment,product_id,status,paid_until,event_at,blocked)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
    status = CASE WHEN excluded.event_at >= subscriptions.event_at THEN excluded.status ELSE subscriptions.status END,
    event_at = MAX(subscriptions.event_at, excluded.event_at),
    paid_until = MAX(subscriptions.paid_until, excluded.paid_until), blocked = MAX(subscriptions.blocked, excluded.blocked)
    WHERE subscriptions.user_id = excluded.user_id AND subscriptions.customer_id = excluded.customer_id AND subscriptions.environment = excluded.environment AND subscriptions.product_id = excluded.product_id`)
    .bind(subscriptionId, userId, idOf(current.customer), env.CREEM_ENVIRONMENT, env.CREEM_PRODUCT_ID, status, paidUntil, updated, blocked ? 1 : 0),
    env.DB.prepare('INSERT OR IGNORE INTO billing_events (id,event_type,processed_at) VALUES (?,?,?)').bind(eventId, type, Date.now())]
  if (attempt) statements.push(env.DB.prepare("UPDATE checkout_attempts SET state = 'completed' WHERE id = ?").bind(attempt.id))
  await env.DB.batch(statements)
  return json({ received: true })
}
