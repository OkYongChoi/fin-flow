# Quality round 04: Verify Basic view URL state

## Review finding
The Basic density control remains represented in the URL after a reload.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-04.spec.ts

