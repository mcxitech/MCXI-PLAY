# MCXI Play — Handoff State

## Current Phase
**Phase 10 — Publicación en Cloudflare (technical work complete)** + **permanent security requirement "Demo vs Paid Product" implemented locally (D020), NOT yet deployed.**
Production: https://mcxi-play.mcxi-tech.workers.dev

## Last Completed Task
D020: public bundle ships only the preview edition (watermark, teaser dedication); the full engine is served only through Worker endpoints that require an `activated` order; `/export-kit/*` returns 404; ZIP has no separate `config.js`. 25/25 regression tests, browser checks for demo, recipient page, buyer ZIP, admin ZIP and offline ZIP.

## ⚠️ Pending deploy (security)
Production still runs the previous version: `/export-kit/game.js` is public (200) there. Deploy:
```
npm run build
npx wrangler deploy
```
Then check: `/export-kit/game.js` → 404, demo shows watermark, a gift link still plays.
(The agent's deploy command was blocked by its permission settings; the owner must run it or allow it.)

## Important Changes
- `src/game/edition.ts` (`__MCXI_FULL__`), `MainScene.ts`, `VictoryScene.ts`: watermark/teaser in preview edition.
- `vite.config.ts` (`false`), `vite.export.config.ts` (`true`).
- `worker/src/lib/engine.ts`: serves full engine + one whitelisted config via `ASSETS`.
- `worker/src/routes/public.ts`: `/api/gifts/:slug/engine.js`, `/api/gifts/manage/:token/engine.js`. `admin.ts`: `/api/admin/orders/:id/engine.js`.
- `worker/src/lib/repo.ts`: slug/token lookups join `orders.status = 'activated'`.
- `wrangler.toml`: `binding = "ASSETS"`, `run_worker_first = ["/api/*", "/export-kit/*"]`.
- `src/pages/GiftPage.tsx`: loads the engine via script tag. `src/lib/exportGift.ts`: `engineUrl.buyer/admin`.
- Requirement text: `docs/PROJECT.md` → "Permanent Requirement: Demo vs Paid Product"; rule in `CLAUDE.md` and `AGENTS.md`; checklist in `docs/TASKS.md`.

## Local note
Since the real `database_id` is in `wrangler.toml`, local D1 is a new database: run `npx wrangler d1 migrations apply mcxi-play-db --local` once on each machine.

## Pending (owner)
1. Deploy (above).
2. `npm run admin:password` (production still has the temporary test password).
3. Real phone test; Antigravity visual review.
4. Real payment data in `PAYMENT_INFO`.
5. Ask Codex to review D020.

## Phase 11 (Kimi/Gemini) — technical support done by Claude
- Catalog name/description/price/active now come from D1 (`src/lib/useTemplates.ts`), so admin edits show on the site and match what orders charge.
- 11 real screenshots in `docs/marketing/` (new art, incl. envelope and final letter); brief in `docs/LAUNCH_BRIEF.md`; official copies in `docs/MARKETING.md`.
- Still for the owner/other AIs: short video (from a phone), copywriting items, privacy/terms review, real purchase test.

## Visual overhaul (D021) — done locally, not deployed
- `src/game/art.ts` (procedural textures, themes, background), `src/game/sounds.ts` (synth sounds), `MainScene.ts` (intro, HUD slots, effects), `VictoryScene.ts` (envelope + letter), `BootScene.ts` (generates art).
- Preview/paid separation unchanged (D020). Check performance on a low-end phone.

## Storefront redesign (D022) — done locally, not deployed
- Kimi's site integrated with self-hosted fonts and corrected FAQ claims; `useTemplates.ts` kept (price always from D1).
- Marketing screenshots 01–07 recaptured with the new site.

## Production status (2026-10-29, verified)
Deployed by the owner: D020 security, D021 game visuals, D022 storefront, price from D1 (now $49), self-hosted fonts. Owner set the real admin password. Checks: `/export-kit/game.js` 404, public bundle has watermark and no gift-config reader, fake engine/buyer links 404, admin 401 without session, 403 without Origin, SPA routes 200, demo shows watermark with generic data.

## Next Task
Owner: real purchase test from a phone (incl. playing to the letter and downloading the ZIP), payment data in `PAYMENT_INFO`, Antigravity visual review. Then Codex audit of D020; Kimi/Gemini continue Phase 11 from docs/LAUNCH_BRIEF.md and docs/MARKETING.md.
