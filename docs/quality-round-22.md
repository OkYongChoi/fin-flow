# Quality round 22: Verify asset deep links

## Review finding
An asset-card deep link visibly marks the opened asset card.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-22.spec.ts

