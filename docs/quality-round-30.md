# Quality round 30: Verify source snapshot version

## Review finding
The data page presents the versioned source snapshot to users.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-30.spec.ts

