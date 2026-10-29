# MCXI Play — Handoff State

## Current Phase
**Phase 10 — Publicación en Cloudflare (technical work complete; 3 owner items pending).**
Production: https://mcxi-play.mcxi-tech.workers.dev

## Last Completed Task
Created D1 `mcxi-play-db` (WNAM), applied migrations 0001–0002 remotely, deployed Worker `mcxi-play`, set `SESSION_SECRET`, verified the full flow in production (API + headless Chrome mobile), deleted the test data, wrote `docs/DEPLOY.md`.

## Important Changes
- `wrangler.toml`: real `database_id`.
- `scripts/set-admin-password.mjs` + `npm run admin:password`: hidden prompt, uploads only the SHA-256 hash as `ADMIN_PASSWORD_HASH`.
- `docs/DEPLOY.md`: deploy, secrets, rollback, D1 export, Time Travel restore, admin lockout.
- `README.md`: link to DEPLOY and production URL.

## Pending (owner)
1. **Set the real admin password:** `npm run admin:password` (production currently has a temporary random password used for testing; nobody else knows it).
2. Test on a real phone at the production URL.
3. Antigravity visual review (mobile).
4. Real payment data in `PAYMENT_INFO` (`src/lib/constants.ts`) before announcing the site; redeploy afterwards (`npm run build && npx wrangler deploy`).

## Pending Errors
None known. Note: a new workers.dev subdomain took ~1 minute to propagate (404 / error 1042 meanwhile).

## Next Task
Owner completes the 4 items above and reviews Phase 10. Phase 11 (commercial launch) belongs to Kimi/Gemini; Claude only for technical changes.
