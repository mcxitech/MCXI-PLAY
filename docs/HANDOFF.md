# MCXI Play — Handoff State

## Current Phase
**Phase 9 — Seguridad y Calidad (COMPLETE, pending owner review).** Next: Phase 10 — Publicación en Cloudflare (needs owner approval and Cloudflare account access).

## Last Completed Task
Processed the Codex Phase 9 audit (`docs/SECURITY_REVIEW.md`): no critical/high findings. Fixed SEC-003 (Origin check on admin mutations), extended regression tests (18/18), documented policies for SEC-002/SEC-004 (D019), verified no secrets in Git history, final build.

## Important Changes
- `worker/src/routes/admin.ts`: non-GET admin requests require `Origin` == Worker origin (403 otherwise).
- `tests/api.test.mjs`: sends `Origin`; new tests for CSRF and concurrent pay vs cancel.
- `docs/SECURITY_REVIEW.md`: Codex report + "Respuesta de Claude Code" table. Previous audit is in Git history (`87c0e75`).
- `docs/DECISIONS.md`: D019.

## Local Setup (not in Git)
- `.dev.vars`: `ADMIN_PASSWORD_HASH=<sha256 hex>` and `SESSION_SECRET=<64 hex chars>`.
- `npx wrangler d1 migrations apply mcxi-play-db --local` (migrations 0001, 0002)
- `npm run build` then `npx wrangler dev` → http://localhost:8787
- Tests: `ADMIN_PASSWORD=<pw> npm run test:api`

## Pending (owner)
- `PAYMENT_INFO` (`src/lib/constants.ts`) still has placeholder data.
- Manual: play a gift to the dedication on a real phone (online and from ZIP); ZIP in Safari/Firefox and over http.

## For Phase 10 (do not start without approval)
- Create D1 database, put its `database_id` in `wrangler.toml`.
- Secrets: `npx wrangler secret put ADMIN_PASSWORD_HASH`, `npx wrangler secret put SESSION_SECRET`.
- Remote migrations: `npx wrangler d1 migrations apply mcxi-play-db --remote`.
- Deploy only through Cloudflare (D019: rate limiting trusts `CF-Connecting-IP`).

## Next Task
Owner review of Phase 9. Then Phase 10, first task: "Configurar Wrangler".
