import { Link } from 'react-router-dom'
import { SITE_NAME } from '@/lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-purple-900/20 text-purple-300 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-white text-lg mb-2 font-display tracking-tight">
            <svg className="inline w-4 h-4 mr-1 text-purple-500" viewBox="0 0 12 9" fill="currentColor" aria-hidden="true">
              <path d="M2 0h2v1h-2zM8 0h2v1h-2zM1 1h4v1h-4zM7 1h4v1h-4zM0 2h12v1H0zM0 3h12v1H0zM1 4h10v1h-10zM2 5h8v1h-8zM3 6h6v1h-6zM4 7h4v1h-4zM5 8h2v1h-2z" />
            </svg>
            {SITE_NAME}
          </p>
          <p className="text-purple-400">Regalos que se juegan. Dedicatorias que se ganan.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Enlaces</p>
          <ul className="space-y-1">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <a href="/#catalogo" className="hover:text-white transition-colors">
                Catálogo
              </a>
            </li>
            <li>
              <a href="/#como-funciona" className="hover:text-white transition-colors">
                Cómo funciona
              </a>
            </li>
            <li>
              <a href="/#incluye" className="hover:text-white transition-colors">
                Qué incluye
              </a>
            </li>
            <li>
              <a href="/#preguntas" className="hover:text-white transition-colors">
                Preguntas frecuentes
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Legal</p>
          <ul className="space-y-1">
            <li>
              <Link to="/privacidad" className="hover:text-white transition-colors">
                Aviso de privacidad
              </Link>
            </li>
            <li>
              <Link to="/condiciones" className="hover:text-white transition-colors">
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-purple-900/20 text-center py-4 text-xs text-purple-500">
        © {year} MCXI. Todos los derechos reservados.
      </div>
    </footer>
  )
}
