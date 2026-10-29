# Revisión independiente de seguridad — MCXI Play

**Fecha:** 2026-10-29  
**Alcance:** autenticación administrativa, autorización de endpoints, enlaces y tokens, activación manual, separación de compradores y exportación independiente.  
**Método:** revisión estática de los archivos relacionados y ejecución de las comprobaciones disponibles. No se modificó código de producción.

## Resumen ejecutivo

La revisión encontró dos vulnerabilidades confirmadas de severidad crítica/alta:

1. La cookie de sesión administrativa no está firmada ni vinculada a ningún secreto; cualquier persona puede fabricar una cookie con una fecha de expiración futura y pasar `isAuthenticated`.
2. El endpoint público de consulta de pedido entrega el `buyerToken` cuando el pedido está activado. El número de pedido se trata como público, por lo que quien lo conozca obtiene acceso de comprador al regalo.

También hay fallos confirmados de control de estado y aislamiento lógico, y varios riesgos potenciales que deben corregirse antes de habilitar producción.

## Hallazgos ordenados por criticidad

### CRÍTICO — SEC-001 — Bypass completo de autenticación administrativa confirmado

- **Archivo/ubicación:** [`worker/src/lib/auth.ts`](../worker/src/lib/auth.ts), líneas 26–30 y 37–49; [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 37–40.
- **Evidencia:** `createSessionCookie` serializa únicamente `{ exp }` con `btoa`. `isAuthenticated` decodifica el valor recibido desde `Cookie`, lo parsea y solo comprueba `session.exp > Date.now()`. No existe firma HMAC, MAC ni comparación contra un secreto.
- **Impacto:** un atacante puede enviar `Cookie: mcxi_admin_session=<base64 de {"exp":<fecha futura>}>` y acceder a todas las APIs administrativas: pedidos, compradores, confirmación de pagos, activación/cancelación, plantillas, estadísticas y auditoría. Esto permite modificar datos y activar regalos sin credenciales.
- **Corrección mínima sugerida:** usar un identificador de sesión aleatorio generado con `crypto.getRandomValues`, almacenarlo server-side (D1/KV/DO) con expiración y revocación, o firmar un payload con HMAC usando un secreto separado. Validar firma, expiración, versión y formato antes de autorizar. Mantener `HttpOnly`, `Secure` en producción y `SameSite=Strict`.
- **Estado:** **confirmada por lectura de código**. El test documentado de “sin cookie” no cubre una cookie falsificada.
- **Corrección (2026-10-29, Claude Code):** sesión firmada con HMAC-SHA256 usando el secreto `SESSION_SECRET`; verificación con `crypto.subtle.verify`; el admin falla cerrado (503) si falta el secreto. Verificado con cookie falsificada → 401.

### ALTA — SEC-002 — Filtración pública del token de gestión del comprador confirmada

- **Archivo/ubicación:** [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 72–96, especialmente 88–93.
- **Evidencia:** `GET /api/orders/:orderNumber` es una ruta pública y, para un pedido activado, incluye `buyerToken` en la respuesta. Ese token es la credencial completa de la ruta `GET /api/gifts/manage/:buyerToken` (líneas 113–130).
- **Impacto:** cualquiera que conozca, intercepte, reciba reenviado o adivine un número de pedido puede obtener acceso de comprador al regalo y a su configuración, y potencialmente a la exportación cuando se implemente. Esto rompe la separación entre consulta pública y administración del comprador; además puede exponer dedicatoria y nombres personalizados.
- **Corrección mínima sugerida:** no devolver nunca `buyerToken` desde la consulta pública de pedido. Entregar el enlace/token únicamente por un canal autenticado o de una sola vez, y separar la respuesta pública de la credencial privada. Invalidar tokens expuestos durante desarrollo/pruebas.
- **Estado:** **confirmada por lectura de código**.
- **Corrección (2026-10-29, Claude Code):** `GET /api/orders/:orderNumber` ya no devuelve `giftSlug` ni `buyerToken`. Verificado.

### ALTA — SEC-003 — Generación de tokens y slugs con PRNG no criptográfico confirmada; riesgo de predicción

- **Archivo/ubicación:** [`worker/src/lib/ulid.ts`](../worker/src/lib/ulid.ts), líneas 12–15, 27–33 y 35–41.
- **Evidencia:** `generateBuyerToken`, `generatePublicSlug` y el sufijo del número de pedido usan `Math.random()`. La decisión D009 documenta una expectativa de 256 bits de entropía para el token, pero `Math.random()` no ofrece ese contrato ni es un generador criptográfico.
- **Impacto:** un atacante que pueda inferir el estado del PRNG, observar suficientes valores o aprovechar una implementación predecible puede adivinar tokens privados o slugs públicos. El token de comprador concede acceso de gestión; el slug concede acceso de juego. La ausencia de rate limiting agrava la superficie.
- **Corrección mínima sugerida:** generar bytes con `crypto.getRandomValues`, codificarlos en base64url/hex y verificar colisiones mediante la restricción `UNIQUE` con reintento. Para números de pedido, conservar el identificador amigable pero no usarlo como secreto.
- **Estado:** **vulnerabilidad de diseño confirmada; explotación práctica dependiente del entorno es riesgo potencial**.
- **Corrección (2026-10-29, Claude Code):** tokens, slugs, número de pedido e IDs usan `crypto.getRandomValues` con muestreo por rechazo. Rate limiting sigue pendiente (SEC-006).

### ALTA — SEC-004 — Cancelación deja accesible un regalo activado confirmada

- **Archivo/ubicación:** [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 122–131; [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 159–165.
- **Evidencia:** la ruta de cancelación solo rechaza el estado `cancelled`; acepta también `activated` y únicamente cambia `orders.status`. No desactiva el registro de `gifts`. La ruta pública de juego solo exige `gifts.active = 1`.
- **Impacto:** un pedido activado y posteriormente cancelado mantiene el enlace público funcionando y conserva el contenido personalizado. La cancelación no revoca el acceso como indican el modelo y el flujo operativo.
- **Corrección mínima sugerida:** restringir transiciones de estado (`pending -> cancelled` y, si el negocio lo permite, `paid -> cancelled`) y rechazar `activated`; si cancelar activados es intencional, ejecutar una operación atómica que ponga `gifts.active = 0` y registrar la revocación.
- **Estado:** **confirmada por lectura de código**.
- **Corrección (2026-10-29, Claude Code):** cancelar solo se permite en `pending` o `paid`; un pedido activado devuelve 400. Verificado.

### MEDIA — SEC-005 — Actualizaciones de estado no son condicionales ni transaccionales; carreras confirmadas como riesgo operativo

- **Archivo/ubicación:** [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts), líneas 84–119 y 122–131; [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 130–151.
- **Evidencia:** pago, cancelación y activación hacen `SELECT`, validan el estado en memoria y después ejecutan `UPDATE`/`INSERT` separados. La activación hace además `getGiftByOrderId` antes de `createGift`.
- **Impacto:** dos solicitudes concurrentes pueden producir auditorías duplicadas, respuestas 500 por la restricción única de `gifts.order_id`, o una combinación inconsistente como regalo creado/activo con pedido finalmente cancelado. El esquema evita dos regalos persistentes, pero no evita estados intermedios ni la carrera de autorización de transición.
- **Corrección mínima sugerida:** usar transacciones/batches cuando estén disponibles y actualizaciones condicionales (`UPDATE ... WHERE id = ? AND status = 'paid'`), comprobar el resultado afectado y crear el regalo dentro de una operación atómica o con idempotencia explícita. Registrar solo la transición que realmente ganó.
- **Estado:** **riesgo potencial confirmado por estructura de código; no se ejecutó una prueba concurrente por falta de dependencias/entorno D1 local**.
- **Corrección (2026-10-29, Claude Code):** pago y cancelación usan `UPDATE ... WHERE status IN (...)` y verifican `meta.changes` (409 si otro request ganó). La activación es un `db.batch` (transacción): inserta el regalo con `INSERT ... SELECT ... WHERE status = 'paid'` y luego cambia el estado. Prueba de regresión: 6 activaciones concurrentes → exactamente 1 éxito y 1 regalo.

### MEDIA — SEC-006 — Número de pedido corto, enumerable y sin protección contra abuso

- **Archivo/ubicación:** [`worker/src/lib/ulid.ts`](../worker/src/lib/ulid.ts), líneas 20–25; [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 72–76; [`worker/src/index.ts`](../worker/src/index.ts), líneas 19–26.
- **Evidencia:** el número público usa solo cuatro caracteres aleatorios y la ruta de consulta no tiene rate limiting, desafío ni límite por IP. El predecible/filtrable número se combina con SEC-002.
- **Impacto:** permite enumerar pedidos y descubrir estados, precios y nombres de plantilla; tras activación, puede convertirse en acceso de comprador por la filtración del token. El riesgo aumenta con reintentos distribuidos y ausencia de controles de abuso.
- **Corrección mínima sugerida:** no usar el número humano como credencial; eliminar el token de la respuesta pública. Añadir rate limiting, respuestas uniformes para no existentes y, si la consulta pública debe mantenerse, un secreto adicional o enlace de consulta de un solo uso.
- **Estado:** **riesgo potencial confirmado por diseño; el impacto de toma de control se materializa junto con SEC-002**.
- **Corrección (2026-10-29, Claude Code):** número de pedido con 8 caracteres aleatorios (~45 bits). Rate limiting en D1 (`rate_limits`, ventana fija por IP vía `CF-Connecting-IP`): login 10/15 min, creación de pedidos 10/hora. No se limitan los GET públicos (cada hit costaría una escritura D1); slugs (~68 bits) y tokens (~182 bits) no son enumerables.

### MEDIA — SEC-007 — Compradores se fusionan por email globalmente, contradiciendo el aislamiento por pedido

- **Archivo/ubicación:** [`worker/src/lib/repo.ts`](../worker/src/lib/repo.ts), líneas 69–85; [`worker/src/routes/public.ts`](../worker/src/routes/public.ts), líneas 43–59; [`worker/migrations/0001_initial.sql`](../worker/migrations/0001_initial.sql), líneas 25–32.
- **Evidencia:** `findOrCreateBuyer` reutiliza cualquier comprador con el mismo email y puede sobrescribir su nombre. El modelo del proyecto indica que el comprador es identificado por pedido, pero la implementación comparte la fila entre pedidos.
- **Impacto:** una solicitud pública con el email de otra persona puede cambiar el nombre mostrado en todos sus pedidos administrativos. Esto causa contaminación entre compradores y pérdida de integridad; no expone por sí solo las configuraciones de los regalos porque los pedidos siguen enlazados individualmente.
- **Corrección mínima sugerida:** crear un comprador por pedido, o definir explícitamente una identidad global con controles de verificación de posesión del email. No permitir que una solicitud pública cambie datos asociados a otros pedidos.
- **Estado:** **confirmada por lectura de código**.
- **Corrección (2026-10-29, Claude Code):** se crea un comprador nuevo por pedido (`createBuyer`); ya no se reutiliza ni sobrescribe por email.

### BAJA / BLOQUEADOR DE ALCANCE — SEC-008 — Exportación independiente no implementada; no puede auditarse el aislamiento del ZIP

- **Archivo/ubicación:** rutas existentes en [`worker/src/routes/public.ts`](../worker/src/routes/public.ts) y [`worker/src/routes/admin.ts`](../worker/src/routes/admin.ts); rutas declaradas en [`docs/PROJECT.md`](PROJECT.md), líneas 194–206; tareas pendientes en [`docs/TASKS.md`](TASKS.md), líneas 181–190.
- **Evidencia:** no existe handler para `/api/gifts/export/:buyerToken` ni `/api/admin/gifts/:id/export`, no hay generador ZIP ni páginas de gestión/exportación en `src/`. El propio checklist mantiene esas tareas pendientes.
- **Impacto:** actualmente no se observa una filtración de ZIP porque la funcionalidad no existe, pero la entrega del token (SEC-002) ya compromete la autorización que debería protegerla. No es posible afirmar que un ZIP futuro contendrá únicamente los datos del comprador.
- **Corrección mínima sugerida:** implementar la exportación solo después de fijar la autorización por token/sesión; construir el archivo con una lista blanca de assets y una única configuración asociada al `gift/order_id`, sin rutas controladas por usuario ni contenido de otros pedidos; añadir pruebas de aislamiento entre dos compradores.
- **Estado:** **deficiencia confirmada, no vulnerabilidad explotable en la versión revisada**.
- **Actualización (2026-10-29):** exportación implementada en Fase 8 (D017): ZIP armado en el navegador a partir de la config obtenida por endpoint autorizado (token de comprador o sesión admin); lista blanca de 5 archivos. Pendiente de auditoría por Codex.

## Riesgos revisados sin hallazgo explotable confirmado

- Las consultas SQL observadas usan parámetros enlazados; no encontré una inyección SQL directa. `updateTemplate` construye nombres de columna desde una lista fija permitida.
- La interfaz React renderiza los valores con escape por defecto y la validación del servidor elimina etiquetas HTML. Aun así, debe conservarse validación por lista blanca si se añade HTML, exportación o nuevos renderizadores.
- `getGiftByPublicSlug` filtra `active = 1`, por lo que el enlace público no devuelve regalos desactivados. El endpoint de gestión, sin embargo, no aplica ese filtro; debe corregirse si `active` representa revocación.
- No hay rate limiting para login, comprobación de pedidos, slugs o tokens. Es un riesgo operativo potencial, especialmente junto con los identificadores débiles.

## Pruebas ejecutadas

Se intentaron ejecutar:

| Comando | Resultado |
|---|---|
| `npm run build` | No ejecutado: PowerShell bloquea `npm.ps1`. |
| `npm run lint` | No ejecutado: PowerShell bloquea `npm.ps1`. |
| `npm run typecheck` | No ejecutado: PowerShell bloquea `npm.ps1`. |
| `npm.cmd run build` | Falló porque `tsc` no está instalado/disponible (`node_modules` ausente). |
| `npm.cmd run lint` | Falló porque `eslint` no está instalado/disponible. |
| `npm.cmd run typecheck` | Falló porque `tsc` no está instalado/disponible. |
| `npx.cmd tsc --noEmit` en `worker/` | Sin resultado útil; las dependencias/herramientas no están disponibles. |

Los resultados históricos de `docs/TESTS.md` se trataron como evidencia documental, no como una ejecución reproducida en esta revisión.

## Prioridad recomendada de corrección

1. Invalidar el esquema de sesión actual y corregir SEC-001.
2. Retirar `buyerToken` de la consulta pública y rotar tokens existentes (SEC-002).
3. Cambiar generación de secretos a CSPRNG y añadir rate limiting (SEC-003/006).
4. Hacer explícitas y atómicas las transiciones de pedido; corregir cancelación/revocación (SEC-004/005).
5. Separar compradores por pedido o introducir verificación de email (SEC-007).
6. Implementar y probar la exportación únicamente después de cerrar autorización y aislamiento (SEC-008).
