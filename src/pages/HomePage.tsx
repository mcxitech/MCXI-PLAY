import GameCard from '@/components/GameCard'
import { SITE_NAME } from '@/lib/constants'
import { useTemplates } from '@/lib/useTemplates'

const STEPS = [
  {
    number: '1',
    title: 'Elige un juego',
    description: 'Explora nuestro catálogo y elige el minijuego perfecto para la ocasión.',
  },
  {
    number: '2',
    title: 'Personalízalo',
    description: 'Agrega nombres, una dedicatoria especial y elige colores y temática.',
  },
  {
    number: '3',
    title: 'Regálalo',
    description: 'Recibe un enlace exclusivo para compartir. ¡Tu persona especial podrá jugar al instante!',
  },
]

export default function HomePage() {
  const { templates, loading } = useTemplates()
  const available = templates.filter((g) => g.available)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sorprende con un{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              videojuego personalizado
            </span>
          </h1>
          <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            {SITE_NAME} convierte tus sentimientos en un regalo interactivo y único.
            Cumpleaños, San Valentín, aniversarios o simplemente porque sí.
          </p>
          <a
            href="#catalogo"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            Ver catálogo
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-16 md:py-24 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 rounded-full bg-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-purple-300 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Catálogo de juegos
          </h2>
          <p className="text-purple-300 text-center mb-12 max-w-xl mx-auto">
            Cada juego es una experiencia única. Personalízalo con nombres, mensajes y colores.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
          {!loading && available.length === 0 && (
            <p className="text-center text-purple-400">Próximamente agregaremos nuevos juegos.</p>
          )}
        </div>
      </section>
    </>
  )
}
