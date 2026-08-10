# Quality round 13: Verify inspector document source

## Review finding
The selected USDC rail links to both relevant Circle primary documents.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-13.spec.ts
