# MCXI Play — Handoff State

## Current Phase
**Phase 9 — Seguridad y Calidad: ready for Codex audit.** Phases 7 and 8 complete.

## Last Completed Task
Pre-audit work by Claude Code: lint fixed (TS 6.0, D018), medium findings SEC-005/006/007 fixed, automated regression suite added (`tests/api.test.mjs`, 16/16 pass). Phase 7 purchase form verified in browser.

## Important Changes
- `worker/src/lib/repo.ts`: `transitionOrder` (conditional UPDATE), `activateOrder` (D1 batch transaction), `isRateLimited` (fixed window in D1), `createBuyer` (one buyer per order; `findOrCreateBuyer` removed). `updateOrderStatus`/`createGift` removed.
- `worker/src/routes/admin.ts`: pay/activate/cancel return 409 if another request changed the order first; login rate limit 10/15 min per IP.
- `worker/src/routes/public.ts`: order creation rate limit 10/hour per IP; one buyer per order.
- `worker/src/lib/ulid.ts`: order number suffix 8 chars.
- `worker/migrations/0002_rate_limits.sql`: new table `rate_limits`. **Must be applied** (local and, in Phase 10, remote).
- `tests/api.test.mjs` + `npm run test:api`.
- `AGENTS.md`: Phase 9 audit scope and local setup for Codex. `CLAUDE.md`: TS 6.0, test command.

## For Codex (Phase 9 audit)
Read `AGENTS.md` → "When Asked to Audit". Start from `docs/SECURITY_REVIEW.md`: SEC-001..007 have fix notes to verify; SEC-008 (ZIP export) is now implementable and pending review. Write findings to `docs/SECURITY_REVIEW.md`; do not change code.

## Local Setup (not in Git)
- `.dev.vars`: `ADMIN_PASSWORD_HASH=<sha256 hex>` and `SESSION_SECRET=<64 hex chars>`.
- `npx wrangler d1 migrations apply mcxi-play-db --local`
- `npm run build` then `npx wrangler dev` → http://localhost:8787
- Tests: `ADMIN_PASSWORD=<pw> npm run test:api`

## Pending
- `PAYMENT_INFO` (`src/lib/constants.ts`) has placeholder bank data; owner will decide (possibly a Mercado Pago payment link).
- Manual: play a gift to the dedication on a real phone (online and from ZIP); ZIP in Safari/Firefox and over http.
- Public GET endpoints are not rate limited (by design, see SEC-006 note).

## Next Task
Codex audit for Phase 9. Then Claude fixes critical/high findings and runs the final build.
