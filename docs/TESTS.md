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

## Pre-audit fixes (SEC-005/006/007) and regression suite

| Test | Command | Result | Date |
|------|---------|--------|------|
| Purchase form + order page in browser (390x844) | CDP: fill customizer → preview → summary → buyer data → "Solicitar compra" | Redirect to `/pedido/MCXI-...`, "Pendiente de pago", payment instructions; button disabled until buyer data; unknown order → "Pedido no encontrado"; 0 JS errors | 2026-10-29 |
| Lint after TS 6.0 | `npm run lint` | Pass, 0 problems | 2026-10-29 |
| Migration 0002 | `npx wrangler d1 migrations apply mcxi-play-db --local` | Applied | 2026-10-29 |
| Login rate limit (manual) | 11 failed logins same IP, then other IP | 401 x10, 429, other IP 401 | 2026-10-29 |
| Regression suite | `ADMIN_PASSWORD=... npm run test:api` | **16/16 pass** (auth, rate limits, validation/XSS, public data, SEC-007, concurrency x6 activate / x5 pay, cancel rules, link isolation, revocation, SPA + export engine) | 2026-10-29 |

## Phase 9 (after Codex audit)

| Test | Command | Result | Date |
|------|---------|--------|------|
| Codex audit | static review + typecheck/lint/build | No critical/high; 2 medium, 2 low (see `docs/SECURITY_REVIEW.md`) | 2026-10-29 |
| Build, worker typecheck, lint | `npm run build`, `npx tsc -p worker/tsconfig.json --noEmit`, `npm run lint` | Pass | 2026-10-29 |
| Secrets in Git history | `git log -p --all` searched for local hash/secret; `.dev.vars` history; `git grep` for `*_HASH=`/`SESSION_SECRET=` values | 0 matches | 2026-10-29 |
| Regression suite | `ADMIN_PASSWORD=... npm run test:api` | **18/18 pass** (added: CSRF Origin check, concurrent pay vs cancel) | 2026-10-29 |
| Admin UI with Origin check | CDP: login form + "Confirmar pago" click | Login OK; order → `paid`, audit `payment.confirmed` | 2026-10-29 |

## Phase 10 (production: https://mcxi-play.mcxi-tech.workers.dev)

Admin checks used a temporary random password (not stored in the repo); the owner replaces it with `npm run admin:password`. The test order was deleted afterwards (DB back to 0 orders/gifts/buyers/audit, 1 template).

| Test | Command | Result | Date |
|------|---------|--------|------|
| D1 + migrations | `wrangler d1 create`, `d1 migrations apply --remote` | 0001, 0002 applied | 2026-10-29 |
| Deploy | `npm run build`, `npx wrangler deploy` | 8 assets, binding `DB` | 2026-10-29 |
| URL + SPA routes | `curl` `/`, `/juego/...`, `/regalo/x`, `/admin`, `/export-kit/game.js` | 200 after ~1 min of workers.dev propagation (first minute: 404 / error 1042) | 2026-10-29 |
| Catalog from D1 | `GET /api/templates` | Template returned | 2026-10-29 |
| Admin auth | no cookie / fake cookie / foreign Origin / login | 401 / 401 / 403 / 200; cookie `HttpOnly; SameSite=Strict; Secure` | 2026-10-29 |
| Order → pay → activate | API with admin session | pending → (activate unpaid 400) → paid → activated | 2026-10-29 |
| Recipient / buyer links | `GET /api/gifts/:slug`, `/api/gifts/manage/:token`, slug as token | Only `config,playCount`; buyer OK; 404 | 2026-10-29 |
| Public lookup privacy | `GET /api/orders/:num` | No slug/token | 2026-10-29 |
| Browser 390x844 (prod) | CDP: `/mi-regalo/:token` → "Descargar ZIP"; `/regalo/:slug` → "Jugar"; unknown gift | Page OK, ZIP 326 KB, canvas, "no disponible"; 0 JS errors | 2026-10-29 |
| ZIP from prod offline | unzip, open `index.html` via `file://`, network blocked | Game running with custom theme; 0 errors, 0 requests | 2026-10-29 |
| Home (prod) | CDP screenshot | Renders; requests only to own domain | 2026-10-29 |
| Deploy doc commands | `wrangler <cmd> --help` for rollback, deployments list, d1 export, d1 time-travel, secret list | All exist | 2026-10-29 |

## Demo vs paid product (D020)

Note: setting the real `database_id` (Phase 10) gave wrangler a new empty local D1; local migrations were re-applied.

| Test | Command | Result | Date |
|------|---------|--------|------|
| Bundle separation | grep built files | Public `createGame-*.js`: watermark + teaser present. `export-kit/game.js`: none | 2026-10-29 |
| Build, worker typecheck, lint | `npm run build`, `npx tsc -p worker/tsconfig.json --noEmit`, `npm run lint` | Pass | 2026-10-29 |
| Regression suite | `ADMIN_PASSWORD=... npm run test:api` | **25/25 pass** (new: public engine 404 + preview-only bundle; pending/paid/cancelled → 409; activated exports own config via buyer/recipient/admin; cross-order blocked; tampered token/slug/params/method, disabled link and rotated token → 404) | 2026-10-29 |
| Demo page (390x844) | CDP screenshot `/demo/atrapa-mi-corazon` | Watermark "VISTA PREVIA · MCXI Play" visible | 2026-10-29 |
| Recipient page | CDP `/regalo/:slug` → "Jugar" | Full engine from `/api/gifts/:slug/engine.js`, custom colors, no watermark; 0 JS errors | 2026-10-29 |
| Buyer ZIP | CDP "Descargar ZIP" on `/mi-regalo/:token` | 4 files (no `config.js`); `game.js` starts with this gift's config; no watermark | 2026-10-29 |
| ZIP offline | open via `file://`, network blocked | Game runs; 0 errors, 0 requests | 2026-10-29 |
| Admin ZIP | CDP login → order detail → "Descargar ZIP" | Downloaded; 0 JS errors | 2026-10-29 |

Not verified visually: preview victory screen (teaser + lock); covered by the bundle string check.

## Phase 11 (technical support)

| Test | Command | Result | Date |
|------|---------|--------|------|
| Price from D1 | admin `PATCH /templates/:id {price_mxn:19900}`, then CDP read of `/`, `/juego/...`, `/personalizar/...`; `POST /api/orders` | All show $199 MXN; order charges 19900 | 2026-10-29 |
| Deactivated template | admin `{active:0}` | Home "Próximamente…", detail "Juego no encontrado"; restored to active, $149 | 2026-10-29 |
| Build + lint + regression | `npm run build`, `npm run lint`, `npm run test:api` | Pass, 25/25 | 2026-10-29 |
| Marketing screenshots | CDP capture (390x844 @2x, 1280x800) with sample data | 7 PNG in `docs/marketing/` | 2026-10-29 |

## Visual overhaul (D021)

Scene-level checks use a scratch harness (outside the repo) that builds the same game code with `window.__game` exposed, so CDP can drive collect/hit/win.

| Test | Command | Result | Date |
|------|---------|--------|------|
| Build, lint, edition separation | `npm run build`, `npm run lint`, grep bundles | Pass; preview strings only in public chunk | 2026-10-29 |
| Full edition sequence (romantic) | harness + CDP: intro → 3 hearts → hit → 7 hearts → victory frames | Intro with names, sparks/slots/cheer text, "¡Ay!" + shake, flash, envelope opens, typewriter letter + signature + replay; 0 JS errors | 2026-10-29 |
| Preview edition victory | harness built with `__MCXI_FULL__=false` | Teaser "Feliz aniversa… 🔒", "se desbloquea al comprar", bottom watermark note | 2026-10-29 |
| Birthday theme | harness | Blue palette, balloons, themed confetti, letter in primary color | 2026-10-29 |
| Regression suite | `npm run test:api` | 25/25 | 2026-10-29 |
| Real app gift + ZIP offline | CDP `/mi-regalo` → ZIP (330 KB) → `file://` with network blocked | New art renders (friendship theme), 0 errors, 0 requests | 2026-10-29 |
| Marketing screenshots | CDP capture + harness frames | 11 PNG in `docs/marketing/` | 2026-10-29 |

## Storefront integration (D022)

| Test | Command | Result | Date |
|------|---------|--------|------|
| Kimi ZIP review | diff against base commit 055e553 | 13 frontend files changed; nothing else | 2026-10-29 |
| Build + lint | `npm run build`, `npm run lint` | Pass | 2026-10-29 |
| Regression suite | `npm run test:api` | 25/25 | 2026-10-29 |
| Third-party requests | CDP network log on `/` | None (fonts self-hosted; Kimi version requested fonts.googleapis.com / fonts.gstatic.com) | 2026-10-29 |
| Fonts loaded | `document.fonts` | Baloo 2 Variable, Plus Jakarta Sans Variable | 2026-10-29 |
| Visual (desktop + 390x844) | CDP full-page screenshots of home, customizer, admin login | Renders; price from D1 ($149) | 2026-10-29 |

## Manual Tests Pending
- Performance of the new effects (particles, confetti) on a low-end Android phone.
- Owner: set production admin password (`npm run admin:password`) and log in at `/admin/login`.
- Real phone (Android/iPhone) on the production URL: full purchase, play a gift to the dedication, download and open the ZIP.
- Antigravity visual/UX review on mobile.
- Exported ZIP served over http (`python -m http.server` / `npx serve`) and in Safari/Firefox: not verified.
