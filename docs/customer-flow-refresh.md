# Customer flow and empty-state refresh

Audit and implementation: 2026-09-22. Issue #205. This extends the [briefing onboarding audit](ux-onboarding.md).

## Journey findings and fixes

1. **Learn → understand:** learning cards changed their URL but revealed no explanation. Institution deep links also lost their selected slug. Cards now open a focusable, bilingual detail region with stages, roles, scope and next actions to sources or a brief. Asset and institution cards use the same path.
2. **Understand → inspect evidence:** SWIFT, Visa, USDC and securities issuance lacked guides. All 19 selectable networks now have a guide. Missing metrics previously removed valid structural sources too; source selection now combines structural and metric references. Missing values are explicitly distinguished from zero, with guides and registry navigation still available.
3. **Inspect → recover:** pending requests looked empty, and malformed HTTP 200 payloads could crash list rendering. Loading, unavailable and genuinely empty states now differ; errors offer retry without losing the selected network. An empty source registry offers retry and learning navigation.
4. **Create → return:** a pending or failed account-library request looked like an empty library. Explicit states now prevent that claim; a genuinely empty library leads back to the draft. Preview/export includes step explanations and new process references. Server archives include metric-only references as well as structural ones.

## Visual changes

Light slate background, white panels, indigo primary actions and teal explanatory surfaces replace inconsistent dark/light colors. Shared semantic color tokens cover the dashboard, guides, workspace, pricing and issuance views. Long sidebar labels wrap, controls have stronger borders and keyboard focus remains visible.

## Evidence and boundaries

Fresh local Chromium screenshots were captured at 1440×1000 and 390×844. Before evidence: `/tmp/flow-before-learn.png`, `/tmp/flow-before-brief.png`, `/tmp/flow-before-empty.png`. After evidence: `/tmp/flow-after-learn.png`, `/tmp/flow-after-dashboard.png`, `/tmp/flow-after-mobile.png`, `/tmp/flow-after-empty.png`, `/tmp/flow-after-registry.png`, `/tmp/flow-after-pricing.png`. These session-local files are not durable repository assets. The empty-metrics and registry captures deliberately inject empty responses; they do not establish a production outage. The in-app browser had no registered browser, so the project's Playwright Chromium workflow was used.

New process descriptions were checked against primary documentation on 2026-09-22:

- [Swift: what Swift does](https://www.swift.com/about-us/who-we-are/what-swift)
- [VisaNet Connect Acceptance](https://developer.visa.com/capabilities/visanet-connect-acceptance/docs)
- [Circle USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses)
- [TreasuryDirect auction process](https://www.treasurydirect.gov/auctions/how-auctions-work/)

The securities guide is explicitly a US Treasury auction example, not a universal issuance sequence. Existing financial metric values and snapshot date (2026.09.05) are unchanged. No missing numbers were invented.

Validation: 75 unit/Worker tests passed; browser suite 115 passed and one existing intentional mobile skip. New journey coverage runs in both locales and desktop/mobile projects, including 320px reflow, detail focus, retry, malformed responses and preserved sources. Worker typecheck, production build, data validator and Wrangler deployment dry run passed. Final screenshot smoke reported no page errors.

Authenticated tests use fixtures and local D1, not real customer accounts. Live Clerk/Creem activation remains separate (#200); no production deploy or payment activation occurred. Keyboard/reflow checks and color review are not a full assistive-technology audit.
