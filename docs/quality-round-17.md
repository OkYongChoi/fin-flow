# Quality round 17: Verify skip link focus target

## Review finding
The skip link sends keyboard focus to the map page main landmark.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-17.spec.ts

