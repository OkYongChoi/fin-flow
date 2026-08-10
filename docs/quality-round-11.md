# Quality round 11: Verify simulation default state

## Review finding
Playback starts paused so the diagram cannot be mistaken for an automatically running live feed.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-11.spec.ts

