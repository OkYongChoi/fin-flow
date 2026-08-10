# Quality round 16: Verify timeline End navigation

## Review finding
End moves roving timeline-tab focus to the final tab.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-16.spec.ts

