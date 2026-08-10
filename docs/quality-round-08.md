# Quality round 08: Verify source registry source links

## Review finding
Every source-registry link explicitly opens an external primary source in a new tab.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-08.spec.ts

