# Quality round 27: Verify selected rail semantics

## Review finding
The selected rail exposes pressed state to assistive technology.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-27.spec.ts

