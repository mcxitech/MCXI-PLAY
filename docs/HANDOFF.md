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
- 7 real screenshots in `docs/marketing/`; brief for copywriters in `docs/LAUNCH_BRIEF.md`.
- Still for the owner/other AIs: victory-screen screenshot and short video (from a phone), all copywriting items, privacy/terms review, real purchase test.

## Next Task
Owner deploys (includes D020 + price fix) and reviews. Then: Codex audit of D020; Kimi/Gemini work from docs/LAUNCH_BRIEF.md.
