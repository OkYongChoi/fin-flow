# Quality round 03: Verify locale switching keeps selected network

## Review finding
The locale switch preserves the selected network query, protecting shareable bilingual links.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-03.spec.ts

