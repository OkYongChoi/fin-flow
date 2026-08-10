# Quality round 15: Verify inspector Home navigation

## Review finding
Home moves roving inspector-tab focus to the first tab.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-15.spec.ts

