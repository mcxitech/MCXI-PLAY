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

## Security fixes (SEC-001..004)

| Test | Command | Result | Date |
|------|---------|--------|------|
| Install | `npm ci` (with `.npmrc` legacy-peer-deps) | Pass — 0 vulnerabilities | 2026-10-29 |
| Full build | `npm run build` | Pass | 2026-10-29 |
| Worker typecheck | `npx tsc -p worker/tsconfig.json --noEmit` | Pass | 2026-10-29 |
| Lint | `npm run lint` | FAIL with TS 7 → Pass after D018 (TS 6.0.3) | 2026-10-29 |
| Forged unsigned cookie (SEC-001) | `curl -H 'Cookie: mcxi_admin_session=<base64 {exp}>' .../admin/stats` | 401 | 2026-10-29 |
| Cookie with fake signature | `curl -H 'Cookie: mcxi_admin_session=<payload>.AAAA' .../admin/stats` | 401 | 2026-10-29 |
| Valid login + stats | login, then `.../admin/stats` | 200 | 2026-10-29 |
| Public order lookup after activation (SEC-002) | `curl .../api/orders/MCXI-...` | 200 — no giftSlug/buyerToken | 2026-10-29 |
| Cancel activated order (SEC-004) | `curl -X PATCH .../cancel` | 400 — rejected | 2026-10-29 |
| Cancel pending order | `curl -X PATCH .../cancel` | 200 — cancelled | 2026-10-29 |
| Gift link and buyer manage link | `/api/gifts/:slug`, `/api/gifts/manage/:token` | 200 | 2026-10-29 |
| Logout, then stats | `.../admin/stats` | 401 | 2026-10-29 |

## Phase 7

| Test | Command | Result | Date |
|------|---------|--------|------|
| Build + worker typecheck | `npm run build`, `npx tsc -p worker/tsconfig.json --noEmit` | Pass | 2026-10-29 |
| SPA deep links | `curl -H 'Sec-Fetch-Mode: navigate'` on `/pedido/X`, `/regalo/X`, `/mi-regalo/X`, `/admin` | 200 (was 404) | 2026-10-29 |
| `/api/*` still served by Worker | `curl /api/nope` | 404 JSON from Worker | 2026-10-29 |
| Two independent orders | `POST /api/orders` x2 | Distinct order numbers, configs kept separate | 2026-10-29 |
| Activate without payment | `PATCH .../activate` | 400 | 2026-10-29 |
| Pay/activate without session | `PATCH .../pay`, `PATCH .../activate` | 401 | 2026-10-29 |
| Payment date + note recorded | `GET /api/admin/orders/:id` | status, payment_date, payment_note present | 2026-10-29 |
| Recipient link per gift | `GET /api/gifts/:slug` | Each returns its own config; only `config` + `playCount` keys | 2026-10-29 |
| Buyer link per gift | `GET /api/gifts/manage/:token` | Each returns its own order | 2026-10-29 |
| Slug used as buyer token | `GET /api/gifts/manage/:slug` | 404 | 2026-10-29 |
| Rotate buyer token | `PATCH .../rotate-token` | Old token 404, new token 200 | 2026-10-29 |
| Rotate without session | `PATCH .../rotate-token` | 401 | 2026-10-29 |
| Disable recipient link | `PATCH .../gift-access {active:false}` | Gift 404, buyer sees active=false, other gift unaffected | 2026-10-29 |
| Re-enable recipient link | `PATCH .../gift-access {active:true}` | 200 | 2026-10-29 |
| Audit trail | `GET /api/admin/audit` | gift.enabled, gift.disabled, gift.token_rotated, gift.activated | 2026-10-29 |

## Phase 8

Browser tests use headless Chrome driven over CDP (scripts kept outside the repo).

| Test | Command | Result | Date |
|------|---------|--------|------|
| Full build incl. export kit | `npm run build` | Pass — `dist/export-kit/game.js` 1.2 MB | 2026-10-29 |
| ZIP contents (Node, production `buildGiftZip`) | config with extra fields (email, token, other order) + `</script>` payload | 5 files only; no extra fields; `<` escaped in config.js and title; no external URLs | 2026-10-29 |
| Engine has no admin/API code | grep `/api/`, `admin`, `react`, `mcxi_admin_session` in `game.js` | 0 matches | 2026-10-29 |
| ZIP opened via `file://`, network blocked | Chrome headless + CDP, wait 3 s, screenshot | Game running, custom colors, 0 JS errors, 0 network requests | 2026-10-29 |
| Engine served with JS type | `curl /export-kit/game.js` | 200 `text/javascript` | 2026-10-29 |
| Missing kit file | `curl /export-kit/nada.js` | 200 `text/html` (SPA fallback) → exporter checks Content-Type | 2026-10-29 |
| Admin detail exposes gift config only with session | `GET /api/admin/orders/:id` | With session: `gift.config`; without: 401 | 2026-10-29 |
| Buyer page (390x844) | open `/mi-regalo/:token`, click "Descargar ZIP" | Page renders, ZIP downloaded (326 KB), 0 JS errors | 2026-10-29 |
| Recipient page (390x844) | open `/regalo/:slug`, click "Jugar"; open `/regalo/NOEXISTE123` | Intro + canvas; "Este regalo no está disponible" | 2026-10-29 |
| Admin UI login + export (1280x900) | login form → `/admin/pedidos/:id` → "Descargar ZIP" | Redirect to `/admin`, links shown, ZIP downloaded, 0 JS errors | 2026-10-29 |
| Dependency audit | `npm audit` after `npm audit fix` (fflate 0.8.3) | 0 vulnerabilities | 2026-10-29 |

## Manual Tests Pending
- Customize form → "Solicitar compra" → `/pedido` page in a real browser (desktop + phone). Not clicked yet.
- Play a gift to the end (dedication screen) on a real phone, both online and from an exported ZIP.
- Exported ZIP served over http (`python -m http.server` / `npx serve`) and in Safari/Firefox: not verified.
