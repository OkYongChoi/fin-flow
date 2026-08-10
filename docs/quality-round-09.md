# Quality round 09: Verify source registry loading state

## Review finding
The source registry exposes a resolved non-busy state after data load.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-09.spec.ts

