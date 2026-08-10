# Quality round 19: Verify mobile menu Escape

## Review finding
Escape closes the mobile menu and returns the accessible collapsed state.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-19.spec.ts

