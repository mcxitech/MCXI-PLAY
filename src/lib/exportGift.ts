import type { GameConfig } from '@/game/config'
import { escapeHtml } from '@/lib/sanitize'
import { SITE_NAME } from '@/lib/constants'

// Builds the gift ZIP in the browser (Workers free plan has ~10 ms CPU per request,
// too little to compress the 1.2 MB engine server-side). See D017.
// The ZIP holds a fixed whitelist of files and only the config passed in.

const ENGINE_URL = '/export-kit/game.js'

export async function downloadGiftZip(config: GameConfig, orderNumber: string): Promise<void> {
  const res = await fetch(ENGINE_URL)
  const type = res.headers.get('Content-Type') ?? ''
  // SPA fallback answers unknown paths with index.html (200), so check the type too
  if (!res.ok || !type.includes('javascript')) {
    throw new Error('No se encontró el motor del juego. Ejecuta el build completo.')
  }
  const engine = new Uint8Array(await res.arrayBuffer())
  const { fileName, data } = await buildGiftZip(config, orderNumber, engine)

  const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/zip' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// Pure function (no DOM, no network) so it can be tested from Node
export async function buildGiftZip(
  config: GameConfig,
  orderNumber: string,
  engine: Uint8Array,
): Promise<{ fileName: string; data: Uint8Array }> {
  const safe = pickConfig(config)
  const folder = `regalo-${orderNumber.replace(/[^A-Za-z0-9-]/g, '')}`
  const enc = new TextEncoder()

  const { zipSync } = await import('fflate')
  const data = zipSync({
    [folder]: {
      'index.html': enc.encode(indexHtml(safe)),
      'config.js': enc.encode(configJs(safe)),
      'game.js': [engine, { level: 6 }],
      'LEEME.txt': enc.encode(readme(safe, orderNumber)),
      'LICENCIA.txt': enc.encode(license(orderNumber)),
    },
  })
  return { fileName: `${folder}.zip`, data }
}

// Copy only known fields so nothing else from the API ends up in the file
function pickConfig(c: GameConfig): GameConfig {
  return {
    recipientName: String(c.recipientName),
    senderName: String(c.senderName),
    dedication: String(c.dedication),
    theme: c.theme,
    primaryColor: String(c.primaryColor),
    secondaryColor: String(c.secondaryColor),
  }
}

function configJs(c: GameConfig): string {
  // Escape "<" so the JSON can never close a script tag
  const json = JSON.stringify(c, null, 2).replace(/</g, '\\u003c')
  return `// Personalización de este regalo. Generado por ${SITE_NAME}.\nwindow.MCXI_GIFT_CONFIG = ${json};\n`
}

function indexHtml(c: GameConfig): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Un regalo para ${escapeHtml(c.recipientName)}</title>
  <style>
    html, body { margin: 0; height: 100%; background: #020617; }
    body { display: flex; align-items: center; justify-content: center; }
    #game { width: min(100vw, 66.67vh); height: min(150vw, 100vh); }
  </style>
</head>
<body>
  <div id="game"></div>
  <script src="config.js"></script>
  <script src="game.js"></script>
</body>
</html>
`
}

function readme(c: GameConfig, orderNumber: string): string {
  return `UN REGALO PARA ${c.recipientName.toUpperCase()}
De parte de: ${c.senderName}
Pedido: ${orderNumber}

CÓMO JUGAR
1. Descomprime este archivo ZIP (clic derecho > "Extraer todo").
2. Abre la carpeta y haz doble clic en "index.html".
3. Se abrirá en tu navegador. No necesita internet ni crear cuenta.

Controles: flechas del teclado en computadora; toca y arrastra en celular.

SI NO ABRE CON DOBLE CLIC
Algunos navegadores restringen archivos locales. Abre una terminal en esta
carpeta y ejecuta uno de estos comandos; luego entra a http://localhost:8000
  - Con Python:  python -m http.server 8000
  - Con Node.js: npx serve -l 8000

CÓMO PUBLICARLO EN INTERNET (GRATIS)
Es un sitio estático: sube la carpeta completa a cualquiera de estos servicios.
  - Cloudflare Pages: dash.cloudflare.com > Workers & Pages > Create > Pages >
    "Upload assets" y arrastra la carpeta.
  - Netlify Drop: app.netlify.com/drop y arrastra la carpeta.
  - GitHub Pages: sube los archivos a un repositorio y activa Pages.
Comparte la dirección que te den. No se necesita base de datos ni servidor.

ARCHIVOS
  index.html   Página del juego
  game.js      Motor del juego
  config.js    Nombres, dedicatoria y colores de este regalo
  LICENCIA.txt Condiciones de uso

Hecho con ${SITE_NAME}.
`
}

function license(orderNumber: string): string {
  return `LICENCIA DE USO PERSONAL — ${SITE_NAME}
Pedido: ${orderNumber}

1. ${SITE_NAME} otorga al comprador y a la persona destinataria una licencia
   personal, no exclusiva y no transferible para jugar, conservar y compartir
   esta copia del regalo con fines privados y no comerciales.
2. Se permite alojar esta copia en un sitio propio para compartirla con la
   persona destinataria, sin cobrar por el acceso.
3. No se permite vender, sublicenciar ni redistribuir el motor del juego
   (game.js), ni usarlo para crear otros regalos o productos.
4. El motor del juego, su diseño y la marca ${SITE_NAME} siguen siendo propiedad
   de ${SITE_NAME}. Esta compra no transfiere código fuente ni derechos sobre ellos.
5. Los textos personalizados (nombres y dedicatoria) pertenecen a quien los escribió.
6. El regalo se entrega "tal cual", sin garantía de compatibilidad con todos los
   navegadores o dispositivos futuros.
`
}
