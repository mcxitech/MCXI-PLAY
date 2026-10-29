# Revisión independiente de seguridad — MCXI Play

**Fecha:** 2026-10-29  
**Alcance:** autenticación administrativa, autorización de endpoints, enlaces y tokens, activación manual de pedidos, separación de compradores y exportación independiente.  
**Método:** revisión estática de los archivos dentro del alcance y ejecución de typecheck, lint y builds disponibles. No se modificó código de producción.

## Resumen ejecutivo

El estado actual corrigió los problemas más graves observados en la revisión anterior: la sesión administrativa ahora usa HMAC, los identificadores usan CSPRNG, el número de pedido ya no entrega credenciales privadas, los compradores se crean por pedido y la activación usa transición condicional en batch.

Quedan dos riesgos potenciales relevantes y una limitación de cobertura: no hay pruebas automatizadas de concurrencia/aislamiento, y la exportación funciona del lado del navegador, por lo que su seguridad depende de la respuesta autenticada de gestión y de la integridad del frontend servido.

## Hallazgos por criticidad

### MEDIA — SEC-001 — Falta de pruebas de concurrencia e idempotencia de activación

- **Archivo/ubicación:** [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 142–164; [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 112–126.
- **Evidencia:** `activateOrder` usa un `DB.batch` con un `INSERT ... SELECT ... WHERE status = 'paid'` y un `UPDATE ... WHERE status = 'paid'`. La lógica es una mejora correcta frente al check-then-act anterior, pero no hay pruebas que ejecuten solicitudes concurrentes ni que verifiquen el comportamiento real de D1 ante carreras y restricciones únicas.
- **Impacto:** si la semántica del binding D1 o una futura modificación rompe la atomicidad esperada, podrían aparecer regalos duplicados, respuestas inconsistentes o auditorías incorrectas. El código actual reduce fuertemente el riesgo, pero la propiedad crítica no está cubierta por regresiones ejecutables.
- **Corrección mínima sugerida:** añadir una prueba de dos activaciones simultáneas que compruebe exactamente un regalo, una transición a `activated`, una respuesta exitosa y una respuesta `409`; añadir pruebas equivalentes para doble pago y pago/cancelación concurrentes.
- **Estado:** **riesgo potencial; no vulnerabilidad confirmada en lectura estática**.

### MEDIA — SEC-002 — Ausencia de expiración o revocación temporal de tokens de comprador

- **Archivo/ubicación:** [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 187–200; [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 113–130.
- **Evidencia:** el `buyerToken` concede acceso mientras permanezca almacenado; `getGiftByBuyerToken` no comprueba expiración. La rotación administrativa reemplaza el token, pero no hay TTL, uso único ni mecanismo de revocación específico para una sesión de comprador.
- **Impacto:** una URL privada filtrada en historial, logs, analítica, capturas o reenvíos conserva acceso a la configuración del regalo y a la descarga local hasta que un administrador rote el token. Esto es coherente con el modelo “enlace privado”, pero aumenta la ventana de exposición.
- **Corrección mínima sugerida:** mantener rotación manual como control mínimo, evitar registrar URLs completas y añadir una opción de revocación explícita; si el negocio lo permite, añadir expiración renovable o un token de sesión separado del enlace permanente.
- **Estado:** **riesgo potencial de exposición de secreto; no acceso no autorizado confirmado sin filtración previa del enlace**.

### BAJA — SEC-003 — Protección CSRF basada solo en SameSite, sin validación de Origin

- **Archivo/ubicación:** [`worker/src/lib/auth.ts`](../worker/src/lib/auth.ts), líneas 47–55; [`worker/src/index.ts`](../worker/src/index.ts), líneas 20–27; [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 46–49 y 93–165.
- **Evidencia:** las mutaciones administrativas se autorizan con cookie y no validan `Origin`/`Referer` ni un token CSRF. La cookie se marca `SameSite=Strict`, lo que mitiga los navegadores modernos, pero el servidor no impone una defensa adicional.
- **Impacto:** navegadores o despliegues/proxies con comportamiento distinto podrían permitir que una página de origen relacionado provoque acciones administrativas usando la sesión del administrador. El riesgo es menor mientras `SameSite=Strict` se respete correctamente.
- **Corrección mínima sugerida:** validar `Origin` contra el origen esperado para `POST`/`PATCH` administrativos y rechazar orígenes ausentes o no permitidos; opcionalmente añadir un token CSRF sincronizado para las mutaciones.
- **Estado:** **riesgo potencial, no explotación confirmada**.

### BAJA — SEC-004 — Rate limiting dependiente de `CF-Connecting-IP`

- **Archivo/ubicación:** [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 24–27; [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 53–57; [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 166–180.
- **Evidencia:** los límites usan directamente `CF-Connecting-IP`, con `unknown` como valor alternativo. Ese encabezado es confiable cuando la solicitud llega realmente desde Cloudflare, pero puede ser falsificable en desarrollo, pruebas o si el Worker queda expuesto detrás de otro proxy.
- **Impacto:** un atacante podría evadir límites en un despliegue no protegido por Cloudflare o provocar que muchos clientes compartan el mismo bucket `unknown`. No sustituye una autenticación fuerte y no permite por sí solo acceso administrativo.
- **Corrección mínima sugerida:** documentar que el Worker solo debe exponerse detrás de Cloudflare, rechazar/normalizar solicitudes directas en entornos públicos y complementar con límites por ruta, cuenta/credencial y señales del proveedor de borde.
- **Estado:** **riesgo potencial de evasión/denegación de servicio**.

## Exportación y separación de datos

### Resultado de revisión

- La exportación se genera en el navegador mediante [`src/lib/exportGift.ts`](../src/lib/exportGift.ts), no en el Worker. El archivo usa una lista fija de entradas (`index.html`, `config.js`, `game.js`, `LEEME.txt`, `LICENCIA.txt`) y `pickConfig` conserva solo los campos conocidos.
- `config.js` escapa `<` antes de interpolar JSON en un script, y el título HTML usa `escapeHtml`; no observé una ruta de traversal ni inclusión de código administrativo u otros pedidos en la construcción del ZIP.
- La gestión del comprador se obtiene mediante [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 113–130, usando el token privado. La consulta pública de pedido, líneas 78–96, ya no devuelve `buyerToken` ni `giftSlug`.
- La desactivación pública filtra `active = 1` en [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 183–185. La gestión puede seguir mostrando el estado y la configuración cuando `active` es falso; esto parece intencional para informar al comprador y no permite jugar ni descargar desde la interfaz, pero debe cubrirse con una prueba de autorización.

No se confirmó filtración entre compradores ni inclusión de datos ajenos en el ZIP. Falta una prueba automatizada que cree dos regalos distintos y verifique que cada token y cada exportación contienen exclusivamente su configuración.

## Controles verificados como corregidos

- Sesión administrativa firmada con HMAC y secreto mínimo de 32 caracteres en [`worker/src/lib/auth.ts`](../worker/src/lib/auth.ts) y [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 17–20 y 46–49.
- Tokens, slugs y números de pedido generados con CSPRNG y muestreo sin sesgo en [`worker/src/lib/ulid.ts`](../worker/src/lib/ulid.ts), líneas 15–46.
- Rate limiting de login y creación de pedidos.
- No se devuelve `buyerToken` desde la consulta pública de pedido.
- Comprador creado por pedido en [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 69–78; no se reutiliza ni sobrescribe la fila de otro comprador.
- Pago, cancelación y activación usan transiciones condicionales; la cancelación no acepta pedidos activados en [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 128–141.
- Las consultas SQL observadas usan parámetros enlazados; no se encontró inyección SQL directa en el alcance.

## Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| `npm.cmd run typecheck` | **Pass** |
| `npm.cmd run lint` | **Pass** |
| `npm.cmd run build` | **Pass**; build frontend y build del bundle independiente. Emitió solo advertencia de chunk grande de Phaser (>500 kB). |
| `npx.cmd tsc --noEmit -p worker/tsconfig.json` | **Pass** |

No se ejecutó una prueba de integración contra D1 ni una prueba concurrente automatizada; el repositorio no expone un script de tests para esos casos.

## Prioridad recomendada

1. Añadir pruebas de concurrencia e aislamiento de dos compradores.
2. Definir política de ciclo de vida para `buyerToken`: rotación, revocación y posible expiración.
3. Añadir validación de `Origin` en mutaciones administrativas.
4. Documentar y reforzar la dependencia de Cloudflare para el rate limiting por IP.

---

## Respuesta de Claude Code (2026-10-29)

La auditoría anterior (SEC-001..008 originales, con notas de corrección) está en el historial de Git, commit `87c0e75`.

| Hallazgo | Acción | Estado |
|---|---|---|
| SEC-001 media — pruebas de concurrencia | Ya existía `tests/api.test.mjs` (requiere `npx wrangler dev`, por eso no se detectó). Se añadió pago vs. cancelación concurrentes. Cubre: 6 activaciones simultáneas → 1 éxito y 1 regalo; 5 pagos → 1 éxito; aislamiento entre dos compradores (slug/token/config). | Cubierto, 18/18 pass |
| SEC-002 media — vida del `buyerToken` | Política documentada en D019: enlace permanente con revocación manual (rotación desde el admin), sin expiración en el MVP. Las páginas usan `referrer: no-referrer`; no hay analítica ni logs de URLs. | Aceptado como riesgo |
| SEC-003 baja — CSRF solo con SameSite | Todas las mutaciones admin (incl. login) exigen `Origin` igual al origen del Worker; si falta o difiere → 403. Verificado: prueba de regresión y clic real en el panel. | Corregido |
| SEC-004 baja — confianza en `CF-Connecting-IP` | Documentado en D019: el Worker solo se publica en Cloudflare (workers.dev o dominio en Cloudflare), donde el encabezado lo fija el borde. | Documentado |
| Exportación | Sin hallazgos. El aislamiento por comprador se prueba vía `/api/gifts/manage/:token`, que es la única fuente de config del ZIP. | Sin cambios |
