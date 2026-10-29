# MCXI Play — Master Checklist

## FASE 0 — Preparación del Proyecto
**Responsable: Claude Code**

- [x] Revisar el directorio actual.
- [x] Crear proyecto React + Vite + TypeScript.
- [x] Configurar Tailwind CSS.
- [x] Configurar Phaser 3.
- [x] Preparar estructura del backend de Cloudflare.
- [x] Configurar TypeScript estricto.
- [x] Configurar ESLint.
- [x] Crear `.gitignore`.
- [x] Crear `.env.example` sin credenciales reales.
- [x] Crear estructura de documentación.
- [x] Crear `CLAUDE.md` y `AGENTS.md`.
- [x] Crear checklist persistente.
- [x] Configurar scripts de desarrollo y compilación.
- [x] Ejecutar compilación inicial.
- [x] Inicializar Git si todavía no existe.
- [x] Crear commit inicial.

---

## FASE 1 — Producto y Arquitectura
**Responsable: Claude Code | Apoyo opcional: Kimi gratuito**

- [x] Definir alcance comercial del MVP.
- [x] Definir el flujo del visitante.
- [x] Definir el flujo del comprador.
- [x] Definir el flujo del destinatario.
- [x] Definir el flujo del administrador.
- [x] Diseñar el modelo de plantillas reutilizables.
- [x] Diseñar la estructura de pedidos.
- [x] Diseñar la estructura de juegos personalizados.
- [x] Diseñar los permisos y accesos.
- [x] Diseñar la estrategia de exportación ZIP.
- [x] Definir rutas públicas y privadas.
- [x] Crear diagrama sencillo de arquitectura.
- [x] Registrar decisiones técnicas.

---

## FASE 2 — Web Principal y Catálogo
**Responsable: Claude Code**

- [x] Crear layout principal.
- [x] Diseñar encabezado MCXI Play.
- [x] Crear identidad visual inicial.
- [x] Crear hero comercial.
- [x] Crear sección "Cómo funciona".
- [x] Crear catálogo de juegos.
- [x] Crear tarjetas reutilizables.
- [x] Crear página individual de videojuego.
- [x] Mostrar precio en MXN.
- [x] Crear botones de demostración.
- [x] Crear navegación adaptable a móviles.
- [x] Crear footer.
- [x] Agregar páginas base de privacidad y condiciones.
- [x] Crear recursos provisionales originales.
- [x] Verificar diseño móvil.
- [x] Ejecutar build.

---

## FASE 3 — Primer Videojuego: "Atrapa mi corazón"
**Responsable: Claude Code**

- [x] Crear escena de carga.
- [x] Crear escena principal.
- [x] Crear personaje original mediante Phaser Graphics o SVG.
- [x] Implementar movimiento.
- [x] Implementar controles de teclado.
- [x] Implementar controles táctiles.
- [x] Implementar corazones coleccionables.
- [x] Implementar dos obstáculos sencillos.
- [x] Implementar colisiones.
- [x] Implementar contador.
- [x] Implementar condiciones de victoria.
- [x] Crear pantalla final.
- [x] Crear botón para volver a jugar.
- [x] Agregar pausa.
- [x] Agregar sonido opcional.
- [x] Verificar rendimiento.
- [x] Verificar escalado.
- [x] Corregir errores críticos.

---

## FASE 4 — Personalizador y Vista Previa
**Responsable: Claude Code**

- [x] Crear formulario de personalización.
- [x] Agregar nombre del destinatario.
- [x] Agregar nombre del remitente.
- [x] Agregar dedicatoria.
- [x] Agregar elección de temática.
- [x] Agregar selección de colores.
- [x] Crear configuración tipada del juego.
- [x] Aplicar cambios al motor sin duplicarlo.
- [x] Crear vista previa.
- [x] Validar límites de caracteres.
- [x] Evitar HTML o scripts de usuarios.
- [x] Distinguir demostración de juego comprado.
- [x] Preparar resumen antes de solicitar compra.
- [x] Probar personalizaciones distintas.

---

## FASE 5 — Base de Datos y API
**Responsable: Claude Code**

- [x] Configurar Cloudflare D1.
- [x] Crear migraciones SQL.
- [x] Crear tabla de plantillas.
- [x] Crear tabla de versiones de plantilla.
- [x] Crear tabla de compradores.
- [x] Crear tabla de pedidos.
- [x] Crear tabla de regalos personalizados.
- [x] Crear registros de accesos cuando sean necesarios.
- [x] Crear registros mínimos de auditoría.
- [x] Crear repositorios de acceso a datos.
- [x] Crear servicios de negocio.
- [x] Crear endpoints públicos necesarios.
- [x] Validar entradas en el servidor.
- [x] Implementar restricciones e índices.
- [x] Probar persistencia de pedidos.
- [x] Probar que no se exponen datos de otros clientes.

---

## FASE 6 — Dashboard Administrativo
**Responsable: Claude Code | Revisión: Codex**

- [x] Implementar autenticación administrativa segura.
- [x] Proteger APIs administrativas del lado del servidor.
- [x] Crear dashboard principal.
- [x] Mostrar pedidos.
- [x] Mostrar compradores.
- [x] Mostrar juegos vendidos.
- [x] Mostrar estados de pago.
- [x] Crear filtros y búsqueda.
- [x] Crear editor de precios.
- [x] Crear editor de configuración de plantillas.
- [x] Crear activación y desactivación de plantillas.
- [x] Crear estadísticas derivadas de datos reales.
- [x] Crear registro de cambios importantes.
- [x] Implementar cierre de sesión.
- [x] Probar accesos no autorizados.
- [x] Preparar auditoría de Codex. (Auditoría en `docs/SECURITY_REVIEW.md`; SEC-001..004 corregidos)

---

## FASE 7 — Pedidos, Activación y Enlaces
**Responsable: Claude Code**

- [x] Crear formulario para solicitar compra. (Verificado en Chrome headless 390x844.)
- [x] Generar número de pedido.
- [x] Registrar pedido pendiente.
- [x] Mostrar instrucciones de pago. (Verificado en navegador. Datos reales pendientes en `PAYMENT_INFO`, ver HANDOFF.)
- [x] Permitir confirmar manualmente el pago desde el dashboard.
- [x] Registrar fecha y estado de pago.
- [x] Activar regalo solamente desde una operación autorizada.
- [x] Generar identificador público aleatorio.
- [x] Crear enlace exclusivo del destinatario.
- [x] Crear token privado de gestión del comprador.
- [x] Separar los permisos de ambos enlaces.
- [x] Implementar revocación de acceso privado.
- [x] Crear página del destinatario. (Verificada en Chrome headless 390x844: intro, juego y regalo inexistente.)
- [x] Crear página de gestión del comprador. (Verificada en Chrome headless 390x844.)
- [x] Impedir el acceso a regalos pendientes.
- [x] Probar múltiples compras independientes.

---

## FASE 8 — Exportación Individual
**Responsable: Claude Code**

- [x] Separar motor de juego y configuración.
- [x] Preparar compilación independiente del videojuego.
- [x] Incluir datos específicos de un comprador.
- [x] Incluir imágenes, audio y estilos necesarios. (No hay archivos externos: gráficos y sonido se generan en código; CSS inline.)
- [x] Crear exportador ZIP.
- [x] Incorporar exportación al dashboard.
- [x] Permitir descarga autorizada al comprador.
- [x] Crear README para el destinatario. (`LEEME.txt`)
- [x] Crear documento de licencia de uso personal. (`LICENCIA.txt`)
- [x] Evitar incluir código fuente administrativo.
- [x] Evitar incluir información de otros compradores.
- [x] Probar funcionamiento sin D1.
- [x] Probar funcionamiento sin APIs de MCXI.
- [x] Comprobar funcionamiento con conexión y sin conexión cuando sea técnicamente viable. (Sin conexión vía `file://` verificado en Chrome. Servidor local http no probado.)
- [x] Documentar cómo alojar el juego fuera de MCXI. (En `LEEME.txt` del ZIP: Cloudflare Pages, Netlify Drop, GitHub Pages, servidor local.)

---

## FASE 9 — Seguridad y Calidad
**Responsable auditor: Codex | Correcciones: Claude Code**

- [x] Revisar autenticación administrativa. (Codex, `docs/SECURITY_REVIEW.md`)
- [x] Revisar autorización en endpoints. (Codex)
- [x] Revisar tokens de compradores. (Codex: SEC-002 media, política documentada en D019)
- [x] Revisar enlaces de destinatarios. (Codex)
- [x] Revisar validación de pedidos. (Primera auditoría de Codex + pruebas de regresión de 422/HTML)
- [x] Revisar posibilidad de activar pagos sin permiso. (Codex + pruebas)
- [x] Revisar XSS. (Codex: export escapado; React escapa por defecto)
- [x] Revisar inyección SQL. (Codex: consultas parametrizadas)
- [x] Revisar seguridad de cookies y sesiones. (Codex SEC-003 baja → corregido con validación de Origin)
- [x] Revisar filtración de datos. (Codex)
- [x] Revisar secretos y variables de entorno. (Claude: historial de Git sin `.dev.vars` ni valores de secretos; Codex no reportó hallazgos)
- [x] Revisar exportaciones ZIP. (Codex: lista blanca, sin datos ajenos)
- [x] Revisar fallos de concurrencia en activación. (Codex SEC-001 → cubierto con pruebas concurrentes)
- [x] Crear pruebas de regresión. (`tests/api.test.mjs`, 18 pruebas; `npm run test:api`.)
- [x] Corregir problemas críticos y altos. (La auditoría final no reportó críticos ni altos.)
- [x] Ejecutar build final.

---

## FASE 10 — Publicación en Cloudflare
**Responsable: Claude Code | Pruebas visuales: Antigravity**

- [x] Configurar Wrangler.
- [x] Crear entorno de producción. (Worker `mcxi-play`, https://mcxi-play.mcxi-tech.workers.dev)
- [x] Configurar bindings D1. (`mcxi-play-db`, id en `wrangler.toml`)
- [ ] Configurar secretos de producción. (`SESSION_SECRET` listo. `ADMIN_PASSWORD_HASH` tiene una contraseña temporal de pruebas: falta que el dueño ejecute `npm run admin:password`.)
- [x] Ejecutar migraciones. (0001 y 0002 remotas)
- [x] Compilar frontend y backend.
- [x] Desplegar en Cloudflare.
- [x] Verificar URL gratuita real.
- [x] Confirmar funcionamiento del catálogo.
- [x] Confirmar funcionamiento del juego. (Página del destinatario y ZIP sin conexión, Chrome headless 390x844)
- [x] Confirmar personalización. (Tema y colores del pedido de prueba aplicados en el juego)
- [x] Confirmar creación de pedido.
- [x] Confirmar acceso administrativo. (Login, cookie `Secure`/`HttpOnly`/`SameSite=Strict`, cookie falsa y Origin ajeno rechazados)
- [x] Confirmar activación de pago manual.
- [x] Confirmar acceso del comprador.
- [x] Confirmar acceso del destinatario.
- [x] Confirmar exportación ZIP. (Descargado desde producción y abierto por `file://` sin red)
- [x] Comprobar privacidad de datos. (Consulta pública sin secretos; slug no sirve como token; la portada solo carga recursos propios)
- [ ] Probar en celular. (Pendiente: celular real del dueño)
- [ ] Solicitar revisión visual a Antigravity. (Pendiente: dueño)
- [x] Corregir problemas críticos. (No se detectaron)
- [x] Documentar despliegue y recuperación. (`docs/DEPLOY.md`)

---

## FASE 11 — Lanzamiento Comercial
**Responsables: Kimi gratuito + Gemini gratuito | Claude solo para cambios técnicos**

- [ ] Preparar nombre comercial de la primera plantilla.
- [ ] Preparar descripción atractiva.
- [ ] Definir precio inicial configurable.
- [ ] Capturar imágenes reales del videojuego.
- [ ] Grabar video corto de demostración.
- [ ] Preparar anuncio de Facebook.
- [ ] Preparar publicación de Instagram.
- [ ] Preparar mensaje para WhatsApp.
- [ ] Preparar respuestas a preguntas frecuentes.
- [ ] Revisar precios y condiciones comerciales.
- [ ] Revisar aviso de privacidad.
- [ ] Probar una compra completa.
- [ ] Publicar anuncios orgánicos.
- [ ] Registrar consultas recibidas.
- [ ] Medir solicitudes y compras reales.
- [ ] Documentar mejoras sugeridas por clientes.

---

## FASE 12 — Segunda Plantilla: "Encuentra tu sorpresa"
**Responsable: Claude Code**

- [ ] Reutilizar sistema de pedidos.
- [ ] Reutilizar personalizador.
- [ ] Reutilizar sistema de enlaces.
- [ ] Reutilizar dashboard.
- [ ] Reutilizar exportador.
- [ ] Implementar nueva mecánica.
- [ ] Probar compatibilidad.
- [ ] Agregar al catálogo.

---

## FASE 13 — Pagos Automáticos
**Responsable: Claude Code | Auditoría: Codex**

- [ ] Evaluar requisitos actuales de Mercado Pago.
- [ ] Implementar Checkout oficial.
- [ ] Implementar Webhooks verificados.
- [ ] Comprobar monto, moneda y pedido.
- [ ] Evitar pagos duplicados.
- [ ] Activar automáticamente regalos pagados.
- [ ] Probar pagos rechazados.
- [ ] Probar reembolsos.
- [ ] Auditar seguridad.
- [ ] Documentar operación.
