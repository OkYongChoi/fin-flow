# Quality round 12: Verify playback speed toggle

## Review finding
The timeline exposes the accelerated playback state when its speed control is toggled.

## Plan and implementation
Add a focused Playwright contract so this behavior is continuously checked on both desktop and mobile projects.

## Code review
The assertion uses accessible roles, names, or stable public URL behavior and does not couple to implementation-only details.

## Validation
CI=1 npx playwright test tests/quality-round-12.spec.ts

