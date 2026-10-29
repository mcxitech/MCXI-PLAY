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

## D015 — Admin delivers gift links privately; revocation by token rotation
**Date:** 2026-10-29
**Decision:** After activation the admin copies both links from the order detail and sends them to the buyer (WhatsApp/email). Buyer access is revoked by rotating `buyer_token`; the recipient link is revoked by `gifts.active = 0`. Pages set `referrer: no-referrer` so tokens in URLs are not leaked to other sites.
**Alternatives:** Show links on the public order page (rejected: SEC-002); automatic email (needs an extra service, out of MVP).
**Reason:** Manual payments already require contacting the buyer; no extra infrastructure.

## D016 — SPA fallback in Workers Static Assets
**Date:** 2026-10-29
**Decision:** `not_found_handling = "single-page-application"` and `run_worker_first = ["/api/*"]` in `wrangler.toml`.
**Reason:** Without it, direct links such as `/regalo/:slug` returned 404 in `wrangler dev` (and would in production).

## D017 — ZIP export built in the browser
**Date:** 2026-10-29
**Decision:** A second Vite build (`vite.export.config.ts`) emits a standalone IIFE engine to `dist/export-kit/game.js`. The admin/buyer page fetches it, takes the gift config from an already-authorized endpoint, and builds the ZIP client-side with `fflate`.
**Alternatives:** Generate the ZIP in the Worker (rejected: compressing ~1.2 MB exceeds the ~10 ms CPU limit of the free plan); pre-built ZIP per gift in storage (needs R2/KV, extra infrastructure).
**Reason:** $0, no CPU limit, no new endpoints. The engine is public anyway (it ships in the SPA); only the config needs authorization.
**Trade-off:** Downloads are not recorded in the audit log.

## D018 — TypeScript 6.0 instead of 7.0
**Date:** 2026-10-29
**Decision:** Pin `typescript@~6.0.3`. Removed `.npmrc` (`legacy-peer-deps`), no longer needed.
**Reason:** typescript-eslint 8.x supports TypeScript <6.1 only, so `npm run lint` crashed with 7.0. Same language; code compiles unchanged. Revisit when typescript-eslint supports 7.x.

## D019 — Phase 9 security policies
**Date:** 2026-10-29
- **Admin CSRF:** every non-GET admin request (including login) must carry `Origin` equal to the Worker's origin, in addition to `SameSite=Strict`. Rejected with 403.
- **Buyer token lifecycle:** permanent private link, revoked manually by rotation from the admin (D015). No expiry in the MVP: buyers come back to share or download weeks later, and expiry would need a recovery flow (email) that is out of scope. Revisit if links leak in practice.
- **Rate limiting trust:** limits key on `CF-Connecting-IP`, which Cloudflare sets at the edge. The Worker must only be exposed through Cloudflare (workers.dev or a Cloudflare-proxied domain), never behind another proxy.
- **Public GETs** (order lookup, gift, manage) are not rate limited: identifiers are not enumerable (order 45 bits, slug ~68 bits, token ~182 bits) and each limit check costs a D1 write.

## D020 — Demo vs paid product: two engine editions, server-gated full engine
**Date:** 2026-10-29
**Decision:**
- Build-time flag `__MCXI_FULL__` (`src/game/edition.ts`). Public SPA bundle (demo + customizer preview) is built with `false`: watermark "VISTA PREVIA · MCXI Play" and the dedication cut to a teaser with a lock. The minifier removes the full branches, so the public JS has no clean edition.
- The full edition (`dist/export-kit/game.js`, `true`) is never served directly: `/export-kit/*` goes through the Worker (`run_worker_first`) and returns 404. The Worker reads it through the `ASSETS` binding and serves it with one gift's whitelisted config embedded, only from:
  - `GET /api/gifts/:publicSlug/engine.js` (recipient play)
  - `GET /api/gifts/manage/:buyerToken/engine.js` (buyer ZIP)
  - `GET /api/admin/orders/:id/engine.js` (admin ZIP, session + Origin rules)
  Each requires the order to be `activated` (SQL join) and, for public/buyer, the gift link active. `Cache-Control: private, no-store`.
- ZIP no longer has a separate `config.js`; the config is inside `game.js`.
**Alternatives:** server-side ZIP (CPU limit, D017); bundling the engine into the Worker script (size/startup cost).
**Residual risks (accepted):** the public preview engine can still be reverse-engineered by a determined person to remove the watermark and run with any text locally; a buyer can edit their own exported copy. Both require deliberate effort and are forbidden by the license; neither yields a link hosted by MCXI.

## D021 — Visual overhaul with procedural art (no image files)
**Date:** 2026-10-29
**Decision:** All game art is drawn at boot with Canvas 2D (`src/game/art.ts`): glossy hearts, character with blinking eyes, grumpy obstacles, themed gradient backgrounds and drifting decorations (hearts / balloons / stars), particles (sparks, trail, confetti). Sounds are synthesized (`src/game/sounds.ts`). New flow: personal intro ("Un juego para X, de parte de Y"), HUD with 10 heart slots, hit feedback, win flash, and a victory sequence (envelope opens, letter with typewriter dedication and signature).
**Alternatives:** PixelLab/AI sprites (cost and commercial-license checks pending; would also need embedding for `file://`), image files (break single-file offline ZIP).
**Reason:** Higher perceived value at $0, no licenses, ZIP still works offline, demo/paid separation (D020) unchanged: preview edition keeps watermark and teaser dedication.
