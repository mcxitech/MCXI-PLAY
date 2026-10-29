# MCXI Play — Handoff State

## Current Phase
**Phase 8 — Exportación Individual (COMPLETE, pending owner review)**

## Last Completed Task
Standalone ZIP export, available from the admin order detail and the buyer page. Verified in headless Chrome, including opening the ZIP via `file://` with the network blocked.

## Important Changes
- `src/export/main.ts`: standalone entry (no React/API). Reads `window.MCXI_GIFT_CONFIG`.
- `vite.export.config.ts`: IIFE build → `dist/export-kit/game.js`. `npm run build` now runs it after the main build.
- `src/lib/exportGift.ts`: `buildGiftZip` (pure, testable) + `downloadGiftZip` (fetches engine, checks Content-Type, triggers download). Contains LEEME.txt and LICENCIA.txt text.
- `src/pages/admin/AdminOrderDetail.tsx`, `src/pages/BuyerManagePage.tsx`: "Descargar ZIP" buttons (buyer only when gift is active).
- `worker/src/routes/admin.ts`: order detail now includes `gift.config`.
- `package.json`: `fflate` 0.8.3 dependency.
- Decision D017: ZIP built client-side (Workers free plan CPU limit).

## Phase 7 status
2 items still unchecked: purchase form and payment instructions were not clicked in a browser. Payment data in `PAYMENT_INFO` (`src/lib/constants.ts`) are placeholders; owner will provide real data later (considering a Mercado Pago payment link instead of a CLABE).

## Local Setup (not in Git)
- `.dev.vars`: `ADMIN_PASSWORD_HASH=<sha256 hex>` and `SESSION_SECRET=<64 hex chars>`.
- Local D1: `npx wrangler d1 migrations apply mcxi-play-db --local`.
- Run: `npm run build` then `npx wrangler dev` → http://localhost:8787.

## Pending Errors
- `npm run lint` fails: typescript-eslint 8.72 supports TypeScript <6.1, project uses ~7.0.2.
- Open findings in `docs/SECURITY_REVIEW.md`: SEC-005, SEC-006, SEC-007 (Phase 9). SEC-008 can now be audited (export exists).

## Next Task
Owner review of Phase 8. Then Phase 9 — Codex audit (auditor) using `docs/SECURITY_REVIEW.md` as the starting point; Claude fixes findings.
