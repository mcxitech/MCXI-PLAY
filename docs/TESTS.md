# MCXI Play — Test Log

## Phase 0

| Test | Command | Result | Date |
|------|---------|--------|------|
| npm install | `npm install` | Pass | 2026-10-28 |
| Vite build | `npm run build` | Pass — 16 modules, 125ms | 2026-10-28 |
| Dev server | `npm run dev` | Pass — serves HTML | 2026-10-28 |

## Phase 2

| Test | Command | Result | Date |
|------|---------|--------|------|
| Vite build | `npm run build` | Pass — 32 modules, 731ms | 2026-10-28 |
| Dev server | `curl localhost:5173` | Pass — HTML served correctly | 2026-10-28 |

## Phase 3

| Test | Command | Result | Date |
|------|---------|--------|------|
| Vite build | `npm run build` | Pass — 41 modules, Phaser code-split (1.2MB chunk) | 2026-10-28 |
| TypeScript | `tsc -b` | Pass — all game scenes type-check | 2026-10-28 |

## Phase 4

| Test | Command | Result | Date |
|------|---------|--------|------|
| Vite build | `npm run build` | Pass — 43 modules, 547ms | 2026-10-28 |

## Phase 5

| Test | Command | Result | Date |
|------|---------|--------|------|
| Worker typecheck | `cd worker && npx tsc --noEmit` | Pass | 2026-10-28 |
| D1 migration | `wrangler d1 execute --local --file=...` | Pass — 14 commands | 2026-10-28 |
| GET /api/templates | `curl localhost:8787/api/templates` | 200 — returns seeded template | 2026-10-28 |
| GET /api/templates/:slug | `curl localhost:8787/api/templates/atrapa-mi-corazon` | 200 — correct data | 2026-10-28 |
| POST /api/orders (valid) | `curl -X POST ...` | 201 — order created with number | 2026-10-28 |
| POST /api/orders (invalid) | `curl -X POST ...` | 422 — field-level errors | 2026-10-28 |
| GET /api/orders/:num | `curl localhost:8787/api/orders/MCXI-...` | 200 — no email exposed | 2026-10-28 |
| GET /api/nonexistent | `curl localhost:8787/api/nonexistent` | 404 | 2026-10-28 |

## Phase 6

| Test | Command | Result | Date |
|------|---------|--------|------|
| Worker typecheck | `cd worker && npx tsc --noEmit` | Pass | 2026-10-29 |
| Full build | `npm run build` | Pass — 51 modules | 2026-10-29 |
| Login (wrong password) | `curl -X POST .../login` | 401 "Contraseña incorrecta" | 2026-10-29 |
| Login (correct password) | `curl -X POST .../login` | 200 + session cookie | 2026-10-29 |
| Unauthorized access | `curl .../admin/stats` (no cookie) | 401 "No autorizado" | 2026-10-29 |
| GET /api/admin/stats | `curl .../admin/stats` | 200 — correct counts | 2026-10-29 |
| GET /api/admin/orders | `curl .../admin/orders` | 200 — orders with buyer info | 2026-10-29 |
| GET /api/admin/orders/:id | `curl .../admin/orders/:id` | 200 — full detail | 2026-10-29 |
| PATCH .../pay | `curl -X PATCH .../pay` | 200 — pending→paid | 2026-10-29 |
| PATCH .../activate | `curl -X PATCH .../activate` | 200 — paid→activated, gift created | 2026-10-29 |
| Double activate | `curl -X PATCH .../activate` | 400 — rejected | 2026-10-29 |
| GET /api/admin/templates | `curl .../admin/templates` | 200 — all templates | 2026-10-29 |
| PATCH /api/admin/templates/:id | `curl -X PATCH .../templates/:id` | 200 — price updated | 2026-10-29 |
| GET /api/admin/audit | `curl .../admin/audit` | 200 — action log | 2026-10-29 |
| POST /api/admin/logout | `curl -X POST .../logout` | 200 — cookie cleared | 2026-10-29 |

## Manual Tests Pending
- None for Phase 6 (all verified via curl).
