import { verifyToken } from '@clerk/backend'
import { briefMarkdown, CLOUD_BRIEF_LIMIT, parseBrief, type SavedBrief } from '../src/briefs'
import manifest from '../public/data/manifest.json'
import sources from '../public/data/sources.json'
import { acquisitionEnabled, checkout, hasAccess, portal, subscriptions, webhook } from './billing'
import { HttpError, json, object, requestJson } from './http'

async function user(request: Request, env: Env) {
  if (!env.CLERK_JWT_KEY || !env.CLERK_ISSUER) throw new HttpError(503, 'auth_unavailable')
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) throw new HttpError(401, 'sign_in_required')
  try {
    const claims = await verifyToken(token, { jwtKey: env.CLERK_JWT_KEY, authorizedParties: [env.APP_ORIGIN] })
    if (claims.iss !== env.CLERK_ISSUER || !claims.sub || claims.sts === 'pending') throw new Error('Invalid session')
    if (request.headers.has('X-Expected-User') && request.headers.get('X-Expected-User') !== claims.sub) throw new Error('Session changed')
    return claims.sub
  } catch { throw new HttpError(401, 'sign_in_required') }
}
export async function api(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname === '/api/webhooks/creem' && request.method === 'POST') return webhook(request, env)
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) throw new HttpError(405, 'method_not_allowed')
  if (request.method !== 'GET' && request.headers.get('Origin') !== env.APP_ORIGIN) throw new HttpError(403, 'origin_denied')
  if (pathname === '/api/config' && request.method === 'GET') return json({ auth: Boolean(env.CLERK_JWT_KEY && env.CLERK_ISSUER), checkout: acquisitionEnabled(env), environment: env.CREEM_ENVIRONMENT })
  const userId = await user(request, env)
  if (pathname === '/api/account' && request.method === 'GET') {
    const rows = await subscriptions(env, userId)
    return json({ userId, pro: hasAccess(rows), hasSubscription: rows.length > 0, checkout: acquisitionEnabled(env), environment: env.CREEM_ENVIRONMENT })
  }
  if (pathname === '/api/billing/checkout' && request.method === 'POST') {
    const body = object(await requestJson(request))
    return checkout(env, userId, body.locale === 'en' ? 'en' : 'ko')
  }
  if (pathname === '/api/billing/portal' && request.method === 'POST') return portal(env, userId)
  if (pathname === '/api/briefs' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT document FROM briefs WHERE user_id = ? ORDER BY updated_at DESC').bind(userId).all<{ document: string }>()
    return json({ briefs: rows.results.map(row => JSON.parse(row.document) as SavedBrief) })
  }
  const briefId = pathname.match(/^\/api\/briefs\/([a-zA-Z0-9-]{1,64})$/)?.[1]
  if (briefId && request.method === 'DELETE') {
    const result = await env.DB.prepare('DELETE FROM briefs WHERE id = ? AND user_id = ?').bind(briefId, userId).run()
    if (!result.meta.changes) throw new HttpError(404, 'brief_missing')
    return json({ deleted: true })
  }
  if (briefId && request.method === 'PUT') {
    if (!hasAccess(await subscriptions(env, userId))) throw new HttpError(403, 'pro_required')
    const draft = parseBrief(await requestJson(request))
    if (!draft) throw new HttpError(400, 'invalid_brief')
    const existing = await env.DB.prepare('SELECT document, updated_at FROM briefs WHERE id = ? AND user_id = ?').bind(briefId, userId).first<{ document: string; updated_at: number }>()
    const expected = request.headers.get('If-Match')
    // Retrying a successful save after a lost response must return that same document.
    if (existing && JSON.stringify((JSON.parse(existing.document) as SavedBrief).draft) === JSON.stringify(draft)) return json({ brief: JSON.parse(existing.document) })
    if (existing ? expected !== String(existing.updated_at) : expected !== null) throw new HttpError(409, 'brief_version_conflict')
    const now = Math.max(Date.now(), (existing?.updated_at ?? 0) + 1)
    const document: SavedBrief = { id: briefId, draft, markdown: briefMarkdown(draft, { ...manifest, sources, metrics: [] }), snapshotVersion: manifest.version, updatedAt: now }
    if (existing) {
      const result = await env.DB.prepare('UPDATE briefs SET document = ?, updated_at = ? WHERE id = ? AND user_id = ? AND updated_at = ?')
        .bind(JSON.stringify(document), now, briefId, userId, existing.updated_at).run()
      if (!result.meta.changes) throw new HttpError(409, 'brief_version_conflict')
    } else {
      const result = await env.DB.prepare(`INSERT INTO briefs (id,user_id,document,updated_at)
        SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM briefs WHERE user_id = ?) < ?
        ON CONFLICT(id) DO NOTHING`).bind(briefId, userId, JSON.stringify(document), now, userId, CLOUD_BRIEF_LIMIT).run()
      if (!result.meta.changes) {
        const raced = await env.DB.prepare('SELECT document FROM briefs WHERE id = ? AND user_id = ?').bind(briefId, userId).first<{ document: string }>()
        if (raced && JSON.stringify((JSON.parse(raced.document) as SavedBrief).draft) === JSON.stringify(draft)) return json({ brief: JSON.parse(raced.document) })
        throw new HttpError(409, 'brief_limit_or_conflict')
      }
    }
    return json({ brief: document })
  }
  throw new HttpError(404, 'not_found')
}
function clerkOrigin(value: string) {
  if (!value) return ''
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.origin !== value) throw new Error('Invalid Clerk frontend origin')
  return url.origin
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (new URL(request.url).pathname.startsWith('/api/')) return await api(request, env)
      const response = await env.ASSETS.fetch(request)
      // Static deployments retain the strict static CSP. The Worker permits only
      // the configured Clerk frontend plus its documented challenge resources.
      const origin = clerkOrigin(env.CLERK_FRONTEND_ORIGIN)
      if (!origin || !response.headers.get('content-type')?.includes('text/html')) return response
      const headers = new Headers(response.headers)
      headers.set('Content-Security-Policy', `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' ${origin} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://img.clerk.com ${origin}; font-src 'self' data:; connect-src 'self' ${origin}; frame-src ${origin} https://challenges.cloudflare.com; worker-src 'self' blob:`)
      return new Response(response.body, { status: response.status, headers })
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.code }, error.status)
      console.error(JSON.stringify({ event: 'request_failed', path: new URL(request.url).pathname }))
      return json({ error: 'temporarily_unavailable' }, 503)
    }
  },
} satisfies ExportedHandler<Env>
