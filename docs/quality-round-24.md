# Quality round 24: Verify network selector validity

## Review finding
The pro-mode network selector exposes all six supported rails.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-24.spec.ts

