# Quality round 23: Verify network metrics visibility

## Review finding
Selecting Visa displays its sourced payments-volume metric in the inspector.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-23.spec.ts
