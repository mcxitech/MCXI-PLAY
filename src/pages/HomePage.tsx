import { Link } from 'react-router-dom'
import GameCard from '@/components/GameCard'
import Faq from '@/components/Faq'
import FloatingHearts from '@/components/FloatingHearts'
import OccasionsMarquee from '@/components/OccasionsMarquee'
import PixelHeart from '@/components/PixelHeart'
import Reveal from '@/components/Reveal'
import { SITE_NAME } from '@/lib/constants'
import { useTemplates } from '@/lib/useTemplates'

const STEPS = [
  {
    number: '1',
    title: 'Elige el reto',
    description:
      'Escoge el juego perfecto para la ocasión: romántico, de cumpleaños o de amistad.',
    icon: (
      <path d="M6 9h4m-2-2v4m7-3h.01M18 13h.01M17.3 5H6.7a4.7 4.7 0 0 0-4.6 3.9L1 14.5A2.6 2.6 0 0 0 5.4 16l1.2-1.6h10.8L18.6 16A2.6 2.6 0 0 0 23 14.5l-1.1-5.6A4.7 4.7 0 0 0 17.3 5Z" />
    ),
  },
  {
    number: '2',
    title: 'Personalízalo',
    description:
      'Escribe los nombres y la dedicatoria secreta que se desbloqueará al ganar.',
    icon: (
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
    ),
  },
  {
    number: '3',
    title: 'Envía el enlace',
    description:
      'Se abre al instante en el navegador de su celular. Sin apps, sin registros, sin esperas de envío.',
    icon: (
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    ),
  },
]

const PERKS = [
  {
    title: 'Enlace único y exclusivo',
    description: 'Tu juego vive en un acceso exclusivo que solo tú compartes con esa persona.',
    span: 'lg:col-span-2',
    icon: (
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    ),
  },
  {
    title: 'Sin descargas ni apps',
    description: 'Abre y juega, directo en el navegador del celular.',
    span: '',
    icon: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />,
  },
  {
    title: 'Dedicatoria secreta',
    description: 'Tu mensaje se esconde tras el reto. Hasta 200 caracteres para decir lo que sientes.',
    span: '',
    icon: (
      <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-4.7-4.7a1 1 0 0 0-.7-.3H7.4a1 1 0 0 0-.7.3L2 8m18 0H2M12 11.5s-2.5-1.6-2.5-3.3a1.6 1.6 0 0 1 2.5-1.3 1.6 1.6 0 0 1 2.5 1.3c0 1.7-2.5 3.3-2.5 3.3Z" />
    ),
  },
  {
    title: 'Nombres y temática a tu gusto',
    description: 'Los nombres de ustedes dos en el juego, con estilo romántico, de cumpleaños o de amistad.',
    span: 'lg:col-span-2',
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8" />
    ),
  },
  {
    title: 'Juegan las veces que quieran',
    description: 'El reto nunca se acaba: su enlace sigue activo para volver a jugar cuando quieran.',
    span: 'lg:col-span-2',
    icon: (
      <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />
    ),
  },
  {
    title: 'Copia descargable',
    description: 'Recibes un ZIP del juego para guardar tu regalo para siempre.',
    span: '',
    icon: (
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    ),
  },
]

function StepIcon({ d }: { d: React.ReactNode }) {
  return (
    <svg
      className="w-7 h-7 text-purple-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  )
}

export default function HomePage() {
  const { templates, loading } = useTemplates()
  const available = templates.filter((g) => g.available)

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/25 to-transparent pointer-events-none" />
        <FloatingHearts />
        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 border border-purple-900/50 bg-slate-950/60 rounded-full px-4 py-1.5 mb-6">
              <PixelHeart className="w-4 h-3" color="#ff2d78" />
              Regalos que se juegan
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
              Un regalo que hay que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-arcade">
                ganarse
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              {SITE_NAME} convierte tus dedicatorias en minijuegos personalizados. Tu persona
              favorita juega desde su celular y, al superar el reto, descubre lo que sientes.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <a
                href="#catalogo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold px-8 py-3.5 rounded-full text-lg transition-all"
              >
                Ver juegos
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </a>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-purple-700 text-purple-200 hover:text-white hover:bg-purple-900/30 font-semibold px-8 py-3.5 rounded-full text-lg transition-colors"
              >
                ¿Cómo funciona?
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-purple-300">
              {['Sin descargas', 'Enlace único', 'Demo gratis'].map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {chip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Mini game HUD decoration (desktop) */}
        <div className="hidden lg:block absolute right-[6%] top-24 rotate-6" aria-hidden="true">
          <div className="bg-slate-950/80 border border-purple-900/50 rounded-2xl px-5 py-4 shadow-2xl shadow-purple-900/40 backdrop-blur">
            <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-2">Atrapa mi corazón</p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <PixelHeart
                  key={i}
                  className="w-3.5 h-2.5"
                  color={i < 8 ? '#ff2d78' : '#4a0b24'}
                />
              ))}
            </div>
            <p className="text-xs text-purple-300 mt-2 font-semibold">
              8/10 <span className="animate-blink text-purple-400">▍</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============ Ocasiones marquee ============ */}
      <OccasionsMarquee />

      {/* ============ Cómo funciona ============ */}
      <section id="como-funciona" className="py-16 md:py-24 px-4 bg-slate-800/30 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
              ¿Cómo funciona?
            </h2>
            <p className="text-purple-300 text-center mb-12 max-w-xl mx-auto">
              De tu idea a su pantalla en tres pasos. Sin apps que instalar ni cuentas que crear.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 120}>
                <div className="h-full bg-slate-900/60 border border-purple-900/30 rounded-2xl p-6 hover:border-purple-700/60 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-display text-4xl font-bold text-purple-600/80 leading-none">
                      {step.number}
                    </span>
                    <span className="w-11 h-11 rounded-xl bg-purple-900/30 border border-purple-900/40 flex items-center justify-center">
                      <StepIcon d={step.icon} />
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-purple-300 text-sm leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Qué incluye ============ */}
      <section id="incluye" className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
              Todo lo que incluye tu regalo
            </h2>
            <p className="text-purple-300 text-center mb-12 max-w-xl mx-auto">
              Un solo precio, todo incluido. Sin sorpresas ni cargos extras.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={(i % 3) * 100} className={perk.span}>
                <div className="h-full bg-slate-800/60 border border-purple-900/30 rounded-2xl p-6 hover:border-purple-700/60 hover:bg-slate-800 transition-colors">
                  <span className="w-11 h-11 rounded-xl bg-purple-900/30 border border-purple-900/40 flex items-center justify-center mb-4">
                    <StepIcon d={perk.icon} />
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-1.5">{perk.title}</h3>
                  <p className="text-purple-300 text-sm leading-relaxed">{perk.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Catálogo ============ */}
      <section id="catalogo" className="py-16 md:py-24 px-4 bg-slate-800/30 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
              Elige tu juego
            </h2>
            <p className="text-purple-300 text-center mb-12 max-w-xl mx-auto">
              Cada juego es una experiencia única. Personalízalo con nombres, mensajes y colores.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((game, i) => (
              <Reveal key={game.slug} delay={i * 120}>
                <GameCard game={game} />
              </Reveal>
            ))}
          </div>
          {!loading && available.length === 0 && (
            <p className="text-center text-purple-400">Próximamente agregaremos nuevos juegos.</p>
          )}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="preguntas" className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
              Preguntas frecuentes
            </h2>
            <p className="text-purple-300 text-center mb-10 max-w-xl mx-auto">
              Todo lo que necesitas saber antes de sorprender a esa persona.
            </p>
          </Reveal>
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ============ CTA final ============ */}
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-transparent pointer-events-none" />
        <FloatingHearts />
        <div className="max-w-3xl mx-auto text-center relative">
          <Reveal>
            <PixelHeart className="w-12 h-9 mx-auto mb-6" color="#ff2d78" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              ¿Listo para que se juegue tu corazón?
            </h2>
            <p className="text-lg text-purple-200 mb-8 max-w-xl mx-auto">
              Personaliza tu minijuego hoy y envía un enlace que nadie va a olvidar.
            </p>
            <Link
              to={available[0] ? `/demo/${available[0].slug}` : '/#catalogo'}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all"
            >
              Probar la demo gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
