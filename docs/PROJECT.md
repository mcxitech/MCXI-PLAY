# MCXI Play — Project Overview

## Commercial Objective
MCXI Play is a web platform where visitors buy personalized videogames as gifts for occasions like Valentine's Day, birthdays, anniversaries, and romantic declarations.

## MVP Scope
- One game template: "Atrapa mi corazón" (arcade 2D, collect hearts, unlock dedication).
- Single admin manages all orders via dashboard.
- Buyers do not create accounts — identified by email per order.
- Recipients play via unique public link, no account needed.
- Payments verified manually by admin (transfer/deposit).
- Prices in MXN, configurable per template from dashboard.
- Standalone ZIP export available per gift.

---

## User Flows

### Visitor Flow
1. Lands on homepage → sees hero, value proposition, "how it works".
2. Browses catalog → sees game cards with name, price, preview image.
3. Clicks a game → sees detail page with description, screenshots, demo button.
4. Clicks "Probar demo" → plays a generic demo (default names/message).
5. Clicks "Personalizar y comprar" → enters customizer.

### Buyer Flow
1. Fills customization form: recipient name, sender name, dedication, theme, colors.
2. Previews the personalized game in real time.
3. Reviews summary (game, personalization, price).
4. Submits purchase request with their email and name.
5. Receives order number + payment instructions on screen and by reference.
6. Makes payment externally (bank transfer, deposit, etc.).
7. Waits for admin confirmation.
8. Once activated, the admin sends the buyer their private management link through a private channel (WhatsApp/email). The public order lookup never reveals links (D015).
9. From management page: sees gift link to share, can request ZIP download.

### Recipient Flow
1. Receives a link from the buyer (WhatsApp, social media, email, etc.).
2. Opens the link → lands on a gift page with the sender's name and a "Play" button.
3. Plays the fully personalized game.
4. Sees the dedication at the end.
5. Can replay. No account, no downloads required.

### Admin Flow
1. Logs in to `/admin` with password.
2. Dashboard shows: pending orders, confirmed orders, active gifts, revenue stats.
3. Views order detail → sees buyer info, personalization, payment status.
4. Confirms payment → marks order as paid, records date.
5. Activates gift → system generates public link + buyer management token.
6. Can manage templates: edit price, toggle active/inactive, edit metadata.
7. Can generate ZIP export for any active gift.
8. Can revoke a gift's access if needed.
9. Logs out.

---

## Data Models

### Template
Represents a reusable game type (e.g., "Atrapa mi corazón").
```
templates
├── id              TEXT PRIMARY KEY (ulid)
├── slug            TEXT UNIQUE NOT NULL
├── name            TEXT NOT NULL
├── description     TEXT NOT NULL
├── price_mxn       INTEGER NOT NULL (centavos)
├── active          INTEGER NOT NULL DEFAULT 1
├── game_type       TEXT NOT NULL (e.g., "catch-hearts")
├── default_config  TEXT NOT NULL (JSON — default personalization)
├── created_at      TEXT NOT NULL (ISO 8601)
└── updated_at      TEXT NOT NULL (ISO 8601)
```

### Template Version
Tracks template changes for future compatibility.
```
template_versions
├── id              TEXT PRIMARY KEY (ulid)
├── template_id     TEXT NOT NULL → templates.id
├── version         INTEGER NOT NULL
├── config_schema   TEXT NOT NULL (JSON Schema for personalization)
├── created_at      TEXT NOT NULL (ISO 8601)
└── UNIQUE(template_id, version)
```

### Buyer
Identified per order, not a registered user.
```
buyers
├── id              TEXT PRIMARY KEY (ulid)
├── name            TEXT NOT NULL
├── email           TEXT NOT NULL
├── created_at      TEXT NOT NULL (ISO 8601)
└── INDEX(email)
```

### Order
```
orders
├── id              TEXT PRIMARY KEY (ulid)
├── order_number    TEXT UNIQUE NOT NULL (human-readable, e.g., "MCXI-20261028-A1B2")
├── buyer_id        TEXT NOT NULL → buyers.id
├── template_id     TEXT NOT NULL → templates.id
├── personalization TEXT NOT NULL (JSON — names, message, theme, colors)
├── price_mxn       INTEGER NOT NULL (centavos, snapshot at order time)
├── status          TEXT NOT NULL (pending | paid | activated | cancelled)
├── payment_date    TEXT (ISO 8601, null until paid)
├── payment_note    TEXT (admin note about payment method/reference)
├── created_at      TEXT NOT NULL (ISO 8601)
└── updated_at      TEXT NOT NULL (ISO 8601)
```

### Gift (personalized game instance)
Created only when order is activated.
```
gifts
├── id              TEXT PRIMARY KEY (ulid)
├── order_id        TEXT UNIQUE NOT NULL → orders.id
├── public_slug     TEXT UNIQUE NOT NULL (random, URL-safe, 12 chars)
├── buyer_token     TEXT UNIQUE NOT NULL (random, 32 chars, for management)
├── config          TEXT NOT NULL (JSON — full game config snapshot)
├── active          INTEGER NOT NULL DEFAULT 1
├── play_count      INTEGER NOT NULL DEFAULT 0
├── created_at      TEXT NOT NULL (ISO 8601)
└── updated_at      TEXT NOT NULL (ISO 8601)
```

### Audit Log (minimal)
```
audit_log
├── id              TEXT PRIMARY KEY (ulid)
├── action          TEXT NOT NULL (e.g., "order.created", "payment.confirmed", "gift.activated")
├── entity_type     TEXT NOT NULL
├── entity_id       TEXT NOT NULL
├── details         TEXT (JSON, optional)
├── performed_by    TEXT NOT NULL ("admin" or "system")
└── created_at      TEXT NOT NULL (ISO 8601)
```

---

## Permissions and Access

| Resource | Public | Buyer (token) | Admin (session) |
|----------|--------|---------------|-----------------|
| Homepage / catalog | ✓ | ✓ | ✓ |
| Game demo | ✓ | ✓ | ✓ |
| Customizer + order form | ✓ | — | — |
| Order confirmation page | ✓ (by order number) | — | — |
| Gift play page | ✓ (by public_slug) | — | — |
| Buyer management page | — | ✓ (by buyer_token) | — |
| ZIP download | — | ✓ | ✓ |
| Admin dashboard | — | — | ✓ |
| Admin API (orders, templates, gifts) | — | — | ✓ |

- Admin auth: password-based session cookie, HttpOnly, Secure, SameSite=Strict.
- Buyer token: URL parameter, not stored in cookies. Grants read-only access to their gift + ZIP download.
- Public slug: URL parameter, grants play-only access. No personalization data exposed beyond what the game shows.
- No JWT. No OAuth. Single admin password stored as hash in Cloudflare secret.

---

## Routes

### Public (frontend)
| Path | Page |
|------|------|
| `/` | Homepage with hero + catalog |
| `/juego/:slug` | Game detail + demo |
| `/personalizar/:slug` | Customizer form |
| `/pedido/:orderNumber` | Order confirmation + payment instructions |
| `/regalo/:publicSlug` | Recipient gift page (play) |
| `/mi-regalo/:buyerToken` | Buyer management page |
| `/privacidad` | Privacy policy |
| `/condiciones` | Terms of service |

### Admin (frontend)
| Path | Page |
|------|------|
| `/admin` | Login |
| `/admin/dashboard` | Dashboard |
| `/admin/pedidos` | Orders list |
| `/admin/pedidos/:id` | Order detail |
| `/admin/plantillas` | Templates list |
| `/admin/plantillas/:id` | Template editor |

### API (Worker)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Public | Create new order |
| GET | `/api/orders/:orderNumber` | Public | Get order status (limited info) |
| GET | `/api/gifts/:publicSlug` | Public | Get gift config for play |
| GET | `/api/gifts/manage/:buyerToken` | Buyer | Get gift management info |
| GET | `/api/templates` | Public | List active templates |
| GET | `/api/templates/:slug` | Public | Get template detail |
| POST | `/api/admin/login` | — | Admin login |
| POST | `/api/admin/logout` | Admin | Admin logout |
| GET | `/api/admin/orders` | Admin | List all orders |
| PATCH | `/api/admin/orders/:id/pay` | Admin | Confirm payment |
| PATCH | `/api/admin/orders/:id/activate` | Admin | Activate gift |
| PATCH | `/api/admin/orders/:id/cancel` | Admin | Cancel order (pending/paid only) |
| PATCH | `/api/admin/orders/:id/rotate-token` | Admin | Revoke buyer link, issue new token |
| PATCH | `/api/admin/orders/:id/gift-access` | Admin | Enable/disable recipient link |
| GET | `/api/admin/templates` | Admin | List all templates |
| PATCH | `/api/admin/templates/:id` | Admin | Update template |
| GET | `/export-kit/game.js` | Static | Standalone engine used inside ZIPs (no gift data) |

ZIPs are built in the browser (D017): the buyer page gets the config from `/api/gifts/manage/:buyerToken`, the admin page from `/api/admin/orders/:id` (`gift.config`). There is no server-side export endpoint.
| GET | `/api/admin/stats` | Admin | Dashboard stats |

---

## Template / Personalization Model

Each game template defines:
1. **game_type** — identifies which Phaser scene set to load (e.g., `"catch-hearts"`).
2. **default_config** — JSON with default values for all personalizable fields.
3. **config_schema** — JSON Schema defining what fields the customizer shows.

Personalization config structure (for "Atrapa mi corazón"):
```json
{
  "recipientName": "Nombre",
  "senderName": "Tu nombre",
  "dedication": "¡Feliz cumpleaños!",
  "theme": "romantic",
  "primaryColor": "#e91e63",
  "secondaryColor": "#9c27b0"
}
```

The Phaser game reads this config at runtime — the same compiled game code renders differently based on the config. No code is duplicated or regenerated per order.

---

## ZIP Export Strategy

The export creates a self-contained folder:
```
regalo-MCXI-XXXX/
├── index.html          # Standalone page with inline CSS
├── game.js             # Phaser engine (IIFE, ~1.2 MB; graphics and sounds are generated in code)
├── config.js           # window.MCXI_GIFT_CONFIG = {...} for this gift only
├── LEEME.txt           # Instructions in Spanish (open, local server, free hosting)
└── LICENCIA.txt        # Personal use license
```

- `index.html` loads `config.js` then `game.js` as classic scripts (not ES modules), so double-click (`file://`) works. Verified offline in Chrome; other browsers not verified, LEEME.txt gives a local-server fallback.
- No assets folder: the game draws everything with Phaser Graphics and synthesizes sound.
- Does NOT include: React, admin code, API calls, other buyers' data, source TypeScript (verified by scanning `game.js`).
- Build: `vite build -c vite.export.config.ts` → `dist/export-kit/game.js` (entry `src/export/main.ts`). The ZIP is assembled client-side in `src/lib/exportGift.ts` with `fflate`.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Cloudflare                     │
│                                                  │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │ Static Assets│    │   Cloudflare Worker     │ │
│  │  (dist/)     │    │                         │ │
│  │              │    │  /api/orders    ─┐      │ │
│  │  index.html  │    │  /api/gifts      ├──┐  │ │
│  │  assets/     │    │  /api/templates   │  │  │ │
│  │  *.js, *.css │    │  /api/admin/*  ──┘  │  │ │
│  └──────────────┘    │                     │  │ │
│         │            │                     ▼  │ │
│         │            │              ┌─────────┐│ │
│    SPA routes        │              │   D1    ││ │
│    (React Router)    │              │ (SQLite)││ │
│         │            │              └─────────┘│ │
│         ▼            └────────────────────────┘ │
│  ┌──────────────┐                                │
│  │  Phaser 3    │  Reads config.json from API    │
│  │  Game Engine │  or embedded in page           │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘

Buyer ──► Homepage ──► Catalog ──► Customize ──► Order ──► Pay (external)
                                                              │
Admin ──► Dashboard ──► Confirm Payment ──► Activate Gift ◄──┘
                                                │
Recipient ◄── Unique Link ◄────────────────────┘
```

---

## MVP Constraints (reiterated)
- Single admin, no user accounts.
- Manual payment verification.
- One initial game template.
- No multiplayer, no runtime AI, no subscriptions.
- Zero-cost infrastructure (Cloudflare free tier).
- Prices in MXN.
