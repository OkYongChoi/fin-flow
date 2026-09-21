# Briefing workspace operations

## Local development and static compatibility

`npm ci && npm run build` still creates the portable static explorer and free local workspace. Without a Clerk publishable key there is no login SDK initialization. `npm run dev` / `npm run preview` are frontend-only; no cloud API is simulated as successful.

For the full server:

```sh
cp .env.example .env
cp .dev.vars.example .dev.vars
# Populate values through a trusted local editor; do not commit secrets.
npm run worker:build
npm run worker:migrate:local
npm run worker:dev
```

Visit `http://localhost:8787/en/workspace`. `APP_ORIGIN` must exactly match the browser origin (localhost and 127.0.0.1 are different). Build with the matching `VITE_CLERK_PUBLISHABLE_KEY`. The server needs the PEM public JWT key, exact Clerk issuer and HTTPS frontend origin. It does not require a Clerk secret API key for token verification. Rotate the public JWT key when Clerk rotates signing keys; old-token verification may fail until configuration is updated.

Clerk keys must belong to the same application/environment. Reuse the existing Clerk operator account, preferably with a dedicated fin-flow application. Sharing the MemoStem application across unrelated domains requires a separate satellite/sign-in design; this implementation does not silently configure it. Never deploy a live publishable key as a way to simulate a test environment.

The Worker build copies `dist` to `dist-worker` and removes the Pages-only `_redirects` file; Worker SPA fallback is configured in Wrangler. The portable static output stays unchanged.

The static CSP stays restrictive. When Clerk is configured on the Worker, HTML gets an origin-specific CSP for that frontend, Clerk images and Cloudflare's challenge frame. Verify actual sign-in, sign-out, account switch and CSP in the target domain before activation. Static hosting with a Clerk key but without the Worker CSP/API setup is not the supported authenticated deployment.

The checked-in D1 UUID is deliberately a placeholder. Provision a dedicated database and replace it before deployment. Never bind MemoStem's database. Production and preview/test must each use distinct D1 databases and Workers/config files. The local runtime compatibility date is 2026-09-21, matching the bundled runtime's supported date.

## Creem configuration

Use the existing merchant account with a **separate fin-flow product**: active, USD 49.00, every-year, recurring, tax-inclusive, quantity one. Disable trials, coupons and promotions for the initial release and verify those settings in the dashboard. Product API validation checks price/currency/recurrence/tax/status; it does not prove all dashboard promotion/trial settings.

Set `CREEM_ENVIRONMENT=test` or `production` and matching `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, `CREEM_PRODUCT_ID`. Store production API key and webhook secret with `wrangler secret put`, not plaintext source or frontend variables. Configure `/api/webhooks/creem` on the fin-flow Worker for checkout, subscription, refund and dispute events. Unknown subscription statuses and missing provider identity/clock remain retryable failures, not grants.

Keep `BILLING_ACQUISITION_ENABLED=false` while configuring lifecycle handling. With the complete test setup, temporarily enable it on the **isolated test Worker** to exercise hosted checkout. The UI labels test checkout explicitly. The same flag is not required for webhook processing, account reads, saved document access or the customer portal.

## Required provider evidence before production sales

Record date, environment, product ID (no keys), deployed revision and redacted event IDs:

1. Clerk sign-in, sign-out, second-account isolation and JWT/CSP behavior on the actual fin-flow domain.
2. Product price/renewal/no-trial/promotion settings; merchant approval and payout readiness.
3. Hosted test payment → signed `subscription.paid` → canonical Pro state → successful private cloud save.
4. Duplicate clicks and interrupted/declined payments: no second payable checkout while the first is unresolved.
5. Portal access and cancellation: renewal stops and paid access lasts through the proven period; expiration blocks new writes but allows existing read/export/delete.
6. Refund/dispute event: access enters review hold; a late paid event cannot re-enable it.
7. Duplicate and delayed webhooks, source review due warnings, service outage and closed-acquisition behavior.
8. A production deployment with correct D1 binding, migrations, HTTPS origin, secrets, legal/support/refund information and an actual production smoke. Local mocked provider tests do not substitute for these.

## Reconciliation and incidents

A checkout POST timeout preserves the pending attempt. Subsequent requests cannot create another checkout; a known provider ID can be retrieved and an explicitly expired checkout can be replaced. A completed checkout remains blocked until lifecycle processing links it. If no provider ID exists, locate the request ID in Creem and attach/replay its event or record evidence of definitive absence before an operator marks that exact attempt expired. Never clear a fence just because time elapsed.

Replay missed events from the provider dashboard, especially `subscription.paid`; checkout completion alone links identity but does not grant a paid period. If metadata is absent on a subscription event and no linked subscription exists, the endpoint returns a retryable error; replay `checkout.completed` first, then the subscription event. No background reconciliation job is implemented, so monitor delivery failures and replay them operationally before opening sales at scale.

Refund and dispute holds are deliberately sticky. An operator must check the exact product, subscription, refund/dispute and current provider payment status before clearing `blocked` on that exact subscription. Partial refunds also require review. Record evidence in the activation issue. Do not delete subscription/event rows or silently regrant from a late event. This release does not automate financial adjustments.

To stop new sales, set `BILLING_ACQUISITION_ENABLED=false`. Continue lifecycle processing, portal and existing-document access. The client shows a useful error and free export if the server is unavailable. User documents and auth tokens must not appear in logs.

## Verification

```sh
npm test
npm run worker:check
npm run worker:build
CI=1 npm run test:e2e
npx wrangler deploy --dry-run
```

Worker integration tests use actual local D1 SQL and RSA-signed Clerk-format JWTs. Creem requests are mocked and events HMAC-signed with a test secret. These verify code boundaries, not real merchant activation. Browser coverage includes desktop and Pixel 7 free workflows; real Clerk/Creem account flows require the evidence above.

Reference contracts checked during implementation: [Clerk token verification](https://clerk.com/docs/reference/backend/verify-token), [Creem webhooks](https://docs.creem.io/skills/creem-api/WEBHOOKS), [Creem API reference](https://docs.creem.io/skills/creem-api/REFERENCE), [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).

## Briefing client version and account continuity

Workspace clients send their expected Clerk user ID; the server compares it to the verified subject before any user operation. Brief updates require `If-Match` with the loaded `updatedAt`. A stale version receives `409 brief_version_conflict`; preserve the local edit and offer export or a separate copy. Identical request retries return the stored copy. A deployment of an older client may therefore need a reload before editing existing documents, while public exploration and read/export remain available.

See `docs/ux-onboarding.md` for temporary per-tab drafts and explicit sign-in handoff. These are not cross-device cloud saves. Before opening production sales, define and exercise customer support and account/data-deletion handling, including cancellation of renewal before deleting an identity. This change does not implement automated account deletion.
