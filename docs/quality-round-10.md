# Quality round 10: Verify map landmark disclaimer

## Review finding
The interactive map landmark retains its explanatory schematic disclaimer.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-10.spec.ts

