# MCXI Play — Handoff State

## Current Phase
**Phase 6 — Dashboard Administrativo (COMPLETE, pending owner review)**

## Last Completed Task
Fixed the critical/high findings from the Codex audit (`docs/SECURITY_REVIEW.md`): SEC-001, SEC-002, SEC-003, SEC-004.

## Important Changes
- `worker/src/lib/auth.ts`: admin session cookie is now signed with HMAC-SHA256 (`SESSION_SECRET`). Old unsigned cookies are rejected. (SEC-001, D013)
- `worker/src/routes/admin.ts`: admin API fails closed (503) if `ADMIN_PASSWORD_HASH` or `SESSION_SECRET` (min. 32 chars) is missing. Cancel only allowed for `pending`/`paid`. (SEC-004)
- `worker/src/routes/public.ts`: `GET /api/orders/:orderNumber` no longer returns `giftSlug`/`buyerToken`. (SEC-002, D014)
- `worker/src/lib/ulid.ts`: all random IDs/tokens use `crypto.getRandomValues` with rejection sampling. (SEC-003, D014)
- `worker/src/index.ts`: new `SESSION_SECRET` env binding.
- `.env.example`: documents `SESSION_SECRET`.
- `.npmrc`: `legacy-peer-deps=true` (TypeScript 7 vs typescript-eslint peer range).

## Local Setup (not in Git)
- `.dev.vars` must contain `ADMIN_PASSWORD_HASH=<sha256 hex>` and `SESSION_SECRET=<64 hex chars>`.
- Local D1: `npx wrangler d1 migrations apply mcxi-play-db --local`.
- Run: `npm run build` then `npx wrangler dev`.

## Production Note
Before deploying (Phase 10) set both secrets: `npx wrangler secret put ADMIN_PASSWORD_HASH` and `npx wrangler secret put SESSION_SECRET`.

## Pending Errors
- `npm run lint` fails: typescript-eslint 8.72 supports TypeScript <6.1, project uses ~7.0.2.
- Medium findings still open in `docs/SECURITY_REVIEW.md`: SEC-005 (non-atomic state transitions), SEC-006 (no rate limiting, short order number), SEC-007 (buyers merged by email). SEC-008 blocked until Phase 8. These belong to Phase 9 unless the owner decides otherwise.

## Relevant Files
- `docs/SECURITY_REVIEW.md` — Codex audit with fix notes
- `worker/src/lib/auth.ts`, `worker/src/lib/ulid.ts`
- `worker/src/routes/admin.ts`, `worker/src/routes/public.ts`

## Next Task
Owner review of Phase 6. Then start Phase 7 — "Crear formulario para solicitar compra".
