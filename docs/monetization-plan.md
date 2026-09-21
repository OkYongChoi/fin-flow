# Flow of Money monetization: briefing workspace

Decision date: 2026-09-22. Implementation issue: [#199](https://github.com/OkYongChoi/fin-flow/issues/199).

## Product and initial customer

The first paid job is preparing a source-backed financial-infrastructure briefing for product onboarding, internal explanation or a lesson. The initial audience is Korean/English fintech product managers, operations practitioners and educators who repeatedly explain messaging, clearing, settlement and issuance. Public sources and the existing explorer stay free. The paid value is a reusable, private body of work across devices, not exclusive access to public facts.

This is a product hypothesis, not a validated market or revenue forecast. We have not interviewed buyers, collected payment or verified willingness to pay. Start narrow rather than build trading signals, live market data, automated investment advice, enterprise procurement or an AI subscription without customer evidence.

## Offer

| Plan | Offer | Price hypothesis |
| --- | --- | --- |
| Explore | Existing explorer, one browser-local draft, up to four-network comparison, annotations and source-linked Markdown export | Free |
| Pro | Explore plus 50 private cloud briefs, reopen/edit across devices, document and source snapshot at each save | USD 49/year, recurring, tax-inclusive; no trial |
| Team (discovery only) | Shared training collections, reviewer workflow and team administration | No advertised price or checkout; validate demand first |

The first implementation intentionally keeps export free so a new visitor can complete the job before buying. Pro expires by server-verified paid period. Expiry does not lock the user's previous work: list/read/export/delete remain available, while cloud creation/update require current Pro access. No automatic document deletion or public sharing.

At the proposed price, 20 paying annual customers would produce USD 980 gross annual billings; 100 would produce USD 4,900, before fees, tax treatment, refunds and expenses. These are arithmetic scenarios, not forecasts. Proceed with paid acquisition only after measuring conversion and operating costs.

## First validation cycle

Owner: repository/product owner. No outreach was sent by this implementation.

1. Recruit five target practitioners through existing personal channels; ask them to explain a real workflow using the free workspace. Record task completion, missing evidence, and whether they need to reuse it next week.
2. Show USD 49/year transparently and ask for an actual purchase when checkout is activated. Record commitments separately from payments; do not interpret clicks as revenue.
3. Target three completed briefs and at least two repeat users among the first five. If most only need one document, test a one-time educational pack before expanding SaaS features.
4. Record the funnel weekly in aggregate: workspace visits → completed/exported brief → return within seven days → pricing visit → checkout → server-verified paid subscriber. This release does not install analytics or collect these metrics automatically.
5. Review four weeks after real checkout opens. Continue only with evidence of repeat use and paid conversion; request interviews about concrete missing workflows rather than adding generic AI features.

Primary operational metrics: active paid accounts, first successful cloud save, repeat document editing, payment-to-entitlement delay, refunds, support time and source-review timeliness. The revenue ledger is Creem plus verified server events, never client success URLs.

## Implemented scope

- `/ko/workspace`, `/en/workspace`: local draft, compare up to four catalog networks, author notes, preview, cited Markdown download, private cloud library when authenticated.
- `/ko/pricing`, `/en/pricing`: offer, annual renewal terms, free entry and explicit unavailable-sales state.
- Optional Clerk React integration, server JWT signature/expiry/issuer/authorized-origin verification.
- Separate Cloudflare Worker/D1 app for private documents, checkout attempts, canonical subscription state and processed events.
- Creem checkout, portal and signed lifecycle reconciliation with product/environment/owner isolation. Only `subscription.paid` proves a paid period. Return redirects do not.
- Duplicate-checkout fence persists across indeterminate provider failures. Webhook processing remains enabled when acquisition closes.
- Refund/dispute events conservatively hold access and block additional purchase pending operator review. No automatic refunds or subscription cancellation.

Saved Markdown contains the source snapshot as of save time. Reopening a draft previews current catalog sources; exporting its saved copy preserves the archived text. Author notes are separated and escaped. No claims of real-time transaction coverage are added.

## Reusing MemoStem

Reuse the existing **operator accounts** for Clerk, Creem and Cloudflare and the proven server-owned entitlement pattern. Use a fin-flow Clerk application under the same account unless a shared-instance domain/satellite design is explicitly configured and verified. This MVP does not configure Clerk satellites or promise single sign-on across unrelated domains.

Use a **new fin-flow Creem product** and webhook secret in the existing merchant account. Never use MemoStem's USD 10 product, `ad_free` entitlement, database, subscription rows or webhook endpoint. Metadata includes `app=fin-flow`, server-owned `userId` and checkout attempt ID. Test and production need isolated D1 databases and matching provider configuration.

Read-only local inspection found MemoStem Clerk keys present (live mode) and no Creem entries in the inspected GitHub secret-name inventory. This does not prove the merchant account lacks dashboard-side configuration. No existing live keys were copied, changed or exposed, and no MemoStem resources were modified.

## Delivery and external activation

See [billing operations](billing-operations.md). The code and local validation are distinct from:

- D1 provisioning and production Worker deployment;
- Clerk domain configuration and actual sign-in/account-switch testing;
- Creem merchant approval, fin-flow product setup, test payment, signed webhook, portal/cancellation/refund evidence;
- production purchases and actual revenue.

Acquisition defaults to false. Do not advertise Pro as purchasable until the complete real provider flow passes. Deployment of the old static Sites artifact alone does not enable cloud storage or authentication.
