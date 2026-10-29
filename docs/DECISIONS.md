# MCXI Play — Technical Decisions

## D001 — TypeScript 7 with legacy-peer-deps
**Date:** 2026-10-28
**Decision:** Keep TypeScript 7 (shipped with Vite 8 scaffold) and use `--legacy-peer-deps` for eslint packages that don't yet support TS7.
**Alternatives:** Downgrade to TS 5.x.
**Reason:** Vite 8 defaults to TS 7. Downgrading would fight the toolchain. The peer-dep warnings are non-blocking.

## D002 — Tailwind CSS v4 with Vite plugin
**Date:** 2026-10-28
**Decision:** Use `@tailwindcss/vite` plugin (v4 approach) instead of PostCSS config.
**Reason:** Tailwind v4 recommends the Vite plugin. Simpler config, faster builds.

## D003 — Cloudflare Workers with Static Assets
**Date:** 2026-10-28
**Decision:** Single Worker serving both API routes and static frontend via Cloudflare's static assets feature.
**Alternatives:** Cloudflare Pages + separate Worker, or Pages Functions.
**Reason:** Simpler deployment. One `wrangler deploy` handles everything. Free tier covers our needs.

## D005 — TypeScript 7 path aliases without baseUrl
**Date:** 2026-10-28
**Decision:** Use `"paths": {"@/*": ["./src/*"]}` without `baseUrl` (removed in TS 7).
**Reason:** TS 7 requires relative paths in the `paths` config and no longer supports `baseUrl`.

## D006 — ULID for primary keys
**Date:** 2026-10-28
**Decision:** Use ULIDs (Universally Unique Lexicographically Sortable Identifiers) as TEXT primary keys in D1.
**Alternatives:** Auto-increment integers, UUIDs.
**Reason:** ULIDs are sortable by creation time (useful for ordering), URL-safe, and don't leak sequence information. D1 is SQLite-based — TEXT keys work well. No auto-increment race conditions in distributed Workers.

## D007 — Prices stored as integer centavos
**Date:** 2026-10-28
**Decision:** Store prices in MXN centavos (e.g., 14900 = $149.00 MXN).
**Alternatives:** Decimal/float, string.
**Reason:** Avoids floating-point rounding errors. Standard practice for financial data.

## D008 — Password-based admin auth with session cookie
**Date:** 2026-10-28
**Decision:** Single admin authenticates with password. Session stored as HttpOnly/Secure/SameSite=Strict cookie. Password hash stored as Cloudflare secret.
**Alternatives:** JWT, OAuth, magic links.
**Reason:** Simplest secure approach for single-admin MVP. No token refresh complexity. Cookie automatically sent with requests.

## D009 — Buyer identified by token, not account
**Date:** 2026-10-28
**Decision:** Buyers receive a random 32-char token in their management URL. No accounts, no passwords, no cookies.
**Alternatives:** Email-based login, magic links.
**Reason:** Minimum friction. Buyer only needs their link. Token is unguessable (256-bit entropy). Acceptable for a gift management page.

## D010 — Separate game bundle for ZIP export
**Date:** 2026-10-28
**Decision:** Build the Phaser game as a standalone bundle that reads config.json at startup. Same bundle used online (config from API) and in ZIP (config from file).
**Alternatives:** Server-side rendering, code generation per gift.
**Reason:** One build artifact serves all gifts. ZIP export is just: bundle + config + assets + wrapper HTML. No per-gift compilation needed.

## D011 — React Router for SPA navigation
**Date:** 2026-10-28
**Decision:** Use `react-router-dom` with `BrowserRouter` for client-side routing.
**Reason:** SPA needs multiple pages (home, game detail, legal, admin) without full page reloads. Standard choice for React apps deployed as static assets on Cloudflare.

## D012 — Static game catalog in constants.ts for MVP
**Date:** 2026-10-28
**Decision:** Game templates defined as a TypeScript array in `src/lib/constants.ts` for Phase 2. Will be replaced by D1 database queries in Phase 5.
**Reason:** Enables building the full frontend without the backend. Data shape matches the planned `templates` table.

## D004 — Monorepo-lite structure
**Date:** 2026-10-28
**Decision:** Keep frontend (`src/`) and worker (`worker/`) in the same repo with separate tsconfigs.
**Alternatives:** Separate repos, npm workspaces.
**Reason:** Simplicity for a solo-developer MVP. No build orchestration overhead.

## D013 — Admin session signed with HMAC (replaces unsigned cookie)
**Date:** 2026-10-29
**Decision:** Session cookie = `base64url(payload).base64url(HMAC-SHA256(payload, SESSION_SECRET))`. Admin API fails closed (503) if `ADMIN_PASSWORD_HASH` or `SESSION_SECRET` (≥32 chars) is missing.
**Alternatives:** Server-side session table in D1 (allows per-session revocation, extra query per request); KV (not needed for one admin).
**Reason:** Fixes SEC-001 with no new infrastructure. Rotating `SESSION_SECRET` invalidates all sessions.

## D014 — Secrets generated with CSPRNG; order number is not a credential
**Date:** 2026-10-29
**Decision:** All random identifiers use `crypto.getRandomValues` with rejection sampling. The public order lookup never returns `giftSlug` or `buyerToken`; the admin delivers links privately.
**Reason:** Fixes SEC-002 and SEC-003.
