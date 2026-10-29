# MCXI Play — Handoff State

## Current Phase
**Phase 7 — Pedidos, Activación y Enlaces (code complete, pending browser verification)**

## Last Completed Task
Full purchase → payment → activation → links flow. All API paths verified with curl; UI pages compile but have not been clicked through in a browser yet.

## Important Changes
- `wrangler.toml`: SPA fallback (`not_found_handling`, `run_worker_first = ["/api/*"]`). Deep links were returning 404 before. (D016)
- `src/pages/CustomizePage.tsx`: summary step now asks for buyer name/email and submits `POST /api/orders`, then redirects to `/pedido/:orderNumber`.
- `src/pages/OrderPage.tsx`: order status + manual payment instructions (from `PAYMENT_INFO` in `src/lib/constants.ts` — placeholders, owner must fill real data).
- `src/pages/GiftPage.tsx`: recipient page `/regalo/:publicSlug` (no site chrome, intro + play).
- `src/pages/BuyerManagePage.tsx`: buyer page `/mi-regalo/:buyerToken` (copy link, WhatsApp share, test gift).
- `src/components/CopyButton.tsx`, `src/lib/api.ts`: shared helpers.
- `worker/src/lib/repo.ts`: `rotateBuyerToken`, `setGiftActive`.
- `worker/src/routes/admin.ts`: `PATCH /orders/:id/rotate-token`, `PATCH /orders/:id/gift-access`.
- `src/pages/admin/AdminOrderDetail.tsx`: full URLs with copy buttons, revoke/regenerate buyer link, disable/enable recipient link. (D015)
- `index.html`: `<meta name="referrer" content="no-referrer">`.

## Local Setup (not in Git)
- `.dev.vars` must contain `ADMIN_PASSWORD_HASH=<sha256 hex>` and `SESSION_SECRET=<64 hex chars>`.
- Local D1: `npx wrangler d1 migrations apply mcxi-play-db --local`.
- Run: `npm run build` then `npx wrangler dev` → http://localhost:8787 (`npm run dev` alone has no `/api`).

## Pending Errors
- `npm run lint` fails: typescript-eslint 8.72 supports TypeScript <6.1, project uses ~7.0.2.
- `PAYMENT_INFO` still has placeholder bank data.
- Medium findings open in `docs/SECURITY_REVIEW.md`: SEC-005, SEC-006, SEC-007 (Phase 9). SEC-008 waits for Phase 8.

## Next Task
Owner runs the browser test listed in `docs/TESTS.md` → "Manual Tests Pending" (desktop + phone). If it passes, mark the 4 UI items of Phase 7 in `docs/TASKS.md` and approve Phase 8.
