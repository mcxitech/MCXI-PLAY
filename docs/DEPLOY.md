# MCXI Play — Despliegue y recuperación

**Producción:** https://mcxi-play.mcxi-tech.workers.dev
**Cuenta Cloudflare:** la del correo de MCXI (plan gratuito) · Worker `mcxi-play` · D1 `mcxi-play-db` (región WNAM)

## Requisitos
- `npm install`
- `npx wrangler login` (una vez por computadora) y `npx wrangler whoami` para confirmar la cuenta.

## Publicar una nueva versión
```
npm run lint
npm run build
npx wrangler d1 migrations apply mcxi-play-db --remote   # solo si hay migraciones nuevas
npx wrangler deploy
```
Antes de publicar, correr pruebas locales: `npx wrangler dev` y `ADMIN_PASSWORD=<local> npm run test:api`.
**No** correr `test:api` contra producción: crea pedidos reales y choca con el límite de pedidos por IP.

## Secretos (nunca en Git)
| Secreto | Cómo se pone | Notas |
|---|---|---|
| `ADMIN_PASSWORD_HASH` | `npm run admin:password` | Pide la contraseña oculta y sube solo el hash SHA-256. Usar también para cambiarla. |
| `SESSION_SECRET` | `node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" \| npx wrangler secret put SESSION_SECRET` | Rotarlo cierra todas las sesiones de admin. |

Ver secretos configurados (solo nombres): `npx wrangler secret list`.
Sin cualquiera de los dos, el admin responde 503 (falla cerrado).

## Recuperación
- **Volver a la versión anterior del código:** `npx wrangler rollback` (elige una versión de `npx wrangler deployments list`). No revierte la base de datos.
- **Respaldo manual de la base:** `npx wrangler d1 export mcxi-play-db --remote --output=respaldo-AAAAMMDD.sql`. Guardarlo fuera del repo (contiene datos de compradores).
- **Restaurar la base a un momento anterior (Time Travel, últimos 30 días):**
  `npx wrangler d1 time-travel info mcxi-play-db` y luego
  `npx wrangler d1 time-travel restore mcxi-play-db --timestamp=<ISO-8601>`.
- **Admin bloqueado por límite de intentos:** esperar 15 minutos, o
  `npx wrangler d1 execute mcxi-play-db --remote --command "DELETE FROM rate_limits WHERE key LIKE 'login:%'"`.
- **Olvido de contraseña de admin:** `npm run admin:password`.

## Reglas
- Publicar solo a través de Cloudflare (workers.dev o dominio en Cloudflare): el límite de intentos confía en `CF-Connecting-IP` (D019).
- Dominio propio: agregarlo en Cloudflare → Workers & Pages → `mcxi-play` → Settings → Domains & Routes. No requiere cambios de código.
