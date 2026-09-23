# Workspace performance iterations

Measured locally on 2026-09-23, against the working-tree build immediately before these performance changes. Both builds include the evidence comparison and editable-backup workflow. This is not a comparison with the deployed site.

## 1. Load only the requested screen

Dashboard and information pages now load on demand, alongside the existing lazy workspace/data routes. The 29-path issuance library loads when the issuance network is selected; its small category/count registry no longer pulls every path into the initial bundle. The jump target remains mounted while that download completes, preserving keyboard focus.

The Clerk-connected workspace is a separate chunk, loaded only when a publishable key is configured. A configured installation still loads Clerk when entering the workspace. Local measurements below used a build without that key; they do not establish authenticated production performance.

Page and issuance download failures show a localized reload action that retains the current URL. Route error boundaries reset failed state without remounting a healthy workspace, preserving in-memory drafts during language/plan switches even if browser storage is blocked.

## 2. Keep typing independent of reference rendering

`BriefReferenceContent` receives only selected networks, source data and document language. React memoization skips its comparison tables and process guides when a title or note changes. Preview text, Markdown generation and synchronous draft persistence continue to reflect each edit. Network, source and document-language changes still update the reference content.

The measured next-frame input timing was essentially unchanged. No significant typing-latency improvement is claimed; the change avoids unnecessary reference reconciliation without delaying draft persistence.

## 3. Share public source snapshots

Explorer, data registry and workspace now use the same React Query definition. Concurrent consumers share requests, and page navigation reuses the snapshot for five minutes. A stale snapshot is eligible for revalidation on mount/focus/reconnect; this is not a polling timer. Explicit retry remains available before expiry.

Only public source files use this cache. Account documents and entitlements retain their existing ownership rules. A failed workspace refresh hides the stale evidence and disables Markdown/PDF export while preserving the draft. Pricing alone does not initiate source fetching.

## Local measurements

Five fresh Chromium desktop contexts per build, 1440×900, 4× CPU slowdown, browser cache disabled, no network throttling, with no other test suite running. The byte measurement sums decoded JavaScript resources downloaded while opening the default workspace. It is not gzip transfer size. The navigation sequence is workspace → explorer → workspace → data → workspace.

| Measure | Before | After |
| --- | ---: | ---: |
| Initial workspace JavaScript, decoded bytes | 516,172 | 408,769 |
| Source JSON requests across the navigation sequence | 12 | 3 |
| Median observed evidence-ready time, 5 samples | 625.7 ms | 588.9 ms |
| Four-network editing, next-animation-frame p95 | 16.7 ms | 16.9 ms |

JavaScript decreased by 20.8%; source requests decreased by 75%. Readiness includes browser-automation observation delay. The input measurement covers 66 characters typed into an existing 5,250-character note; it measures the next animation frame, not INP or completed paint. Timing samples are diagnostic, not production Core Web Vitals or a statistically established speedup.

Reproduce against a production preview:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
# In a second terminal:
node scripts/measure-workspace.mjs http://127.0.0.1:4174 /tmp/workspace-performance.json
```

The benchmark records resource names, per-run results, request counts and browser exceptions. Request reuse/expiry, failed refresh safety, lazy download recovery, keyboard focus and draft preservation are covered by automated tests; timing thresholds are deliberately excluded from CI.

## Performance-stage validation

At the completion of this performance stage, 96 unit/Worker tests and 143 desktop/mobile browser tests passed, with one desktop-only keyboard test skipped on mobile; 18 targeted browser checks repeated against the production build; TypeScript, data validation, Worker build and Wrangler deployment dry run. Desktop/mobile rendered smoke reported no browser errors or document overflow; printing restored the prior collapsed disclosures. No live deployment or provider activation was performed.
