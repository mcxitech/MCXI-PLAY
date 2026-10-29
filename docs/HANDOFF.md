# MCXI Play — Handoff State

## Current Phase
**Phase 6 — Dashboard Administrativo (NEARLY COMPLETE)**

## Last Completed Task
Admin backend API + React admin frontend. All endpoints tested locally.

## Important Changes
- Created admin authentication (`worker/src/lib/auth.ts`): SHA-256 password hashing, constant-time comparison, HttpOnly/SameSite=Strict session cookies with 8hr expiry.
- Created admin API routes (`worker/src/routes/admin.ts`): login, logout, stats, orders CRUD (list/detail/pay/activate/cancel), template management (list/update price/active), audit log.
- Added 6 new Repo methods: `getStats()`, `listOrdersAdmin()`, `getBuyerById()`, `listAllTemplates()`, `updateTemplate()`, `listAuditLog()`.
- Wired admin routes into worker entry point (`worker/src/index.ts`).
- Created admin API client (`src/lib/admin-api.ts`) with typed interfaces.
- Created admin React pages: login, dashboard (8 stat cards), orders list (filter+search), order detail (actions: pay/activate/cancel), templates editor (inline edit price/name/description/active), audit log table.
- Created `AdminLayout` component with navigation and logout.
- Added admin routes to React Router (`/admin/login`, `/admin`, `/admin/pedidos`, `/admin/pedidos/:id`, `/admin/plantillas`, `/admin/auditoria`).
- Created `.dev.vars` with test admin password hash for local development.
- `ADMIN_PASSWORD_HASH` env var must be set as a Cloudflare secret for production.

## Test Results
- Worker typecheck: Pass
- Full build: Pass (51 modules)
- Login with wrong password: 401 "Contraseña incorrecta"
- Login with correct password: 200 + session cookie
- Unauthorized access (no cookie): 401 "No autorizado"
- GET /api/admin/stats: Correct counts and revenue
- GET /api/admin/orders: Returns orders with buyer info, supports status filter and search
- GET /api/admin/orders/:id: Full detail with personalization, buyer, gift info
- PATCH /api/admin/orders/:id/pay: pending→paid with payment note
- PATCH /api/admin/orders/:id/activate: paid→activated, generates gift with public slug
- Double activate prevention: 400 "Solo se pueden activar pedidos pagados"
- GET /api/admin/templates: All templates including inactive
- PATCH /api/admin/templates/:id: Price update verified
- GET /api/admin/audit: Chronological action log
- POST /api/admin/logout: Clears session cookie

## Relevant Files
- `worker/src/lib/auth.ts` — Admin authentication
- `worker/src/routes/admin.ts` — Admin API routes
- `worker/src/lib/repo.ts` — Updated with 6 new admin methods
- `worker/src/index.ts` — Updated with admin route handler
- `src/lib/admin-api.ts` — Frontend API client
- `src/components/AdminLayout.tsx` — Admin navigation shell
- `src/pages/admin/AdminLoginPage.tsx` — Login page
- `src/pages/admin/AdminDashboard.tsx` — Stats dashboard
- `src/pages/admin/AdminOrders.tsx` — Orders list with filters
- `src/pages/admin/AdminOrderDetail.tsx` — Order detail + actions
- `src/pages/admin/AdminTemplates.tsx` — Template editor
- `src/pages/admin/AdminAuditLog.tsx` — Audit log viewer
- `.dev.vars` — Local dev secrets (test password hash)

## Pending Errors
None.

## Next Task
Remaining: "Preparar auditoría de Codex" (prepare instructions for Codex security audit). Then Phase 6 is complete.
