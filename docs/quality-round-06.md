# Quality round 06: Verify information-page map links

## Review finding
Network information cards navigate users to the corresponding focused map view.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-06.spec.ts

