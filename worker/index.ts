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
    const now = Date.now()
    const document: SavedBrief = { id: briefId, draft, markdown: briefMarkdown(draft, { ...manifest, sources, metrics: [] }), snapshotVersion: manifest.version, updatedAt: now }
    // One SQL statement enforces ownership and capacity, including concurrent saves.
    const result = await env.DB.prepare(`INSERT INTO briefs (id,user_id,document,updated_at)
      SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM briefs WHERE user_id = ?) < ? OR EXISTS(SELECT 1 FROM briefs WHERE id = ? AND user_id = ?)
      ON CONFLICT(id) DO UPDATE SET document = excluded.document, updated_at = excluded.updated_at WHERE briefs.user_id = excluded.user_id`)
      .bind(briefId, userId, JSON.stringify(document), now, userId, CLOUD_BRIEF_LIMIT, briefId, userId).run()
    if (!result.meta.changes) throw new HttpError(409, 'brief_limit_or_conflict')
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
