import { cp, rm } from 'node:fs/promises'
// Pages rewrites conflict with Worker Assets' built-in SPA handling.
// Preserve the portable static artifact and prepare a separate Worker artifact.
await rm('dist-worker', { recursive: true, force: true })
await cp('dist', 'dist-worker', { recursive: true })
await rm('dist-worker/_redirects', { force: true })
