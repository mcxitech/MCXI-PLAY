import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE_NAME } from '@/lib/constants'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-purple-900/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl font-display tracking-tight">
          <svg className="w-5 h-5 text-purple-500" viewBox="0 0 12 9" fill="currentColor" aria-hidden="true">
            <path d="M2 0h2v1h-2zM8 0h2v1h-2zM1 1h4v1h-4zM7 1h4v1h-4zM0 2h12v1H0zM0 3h12v1H0zM1 4h10v1h-10zM2 5h8v1h-8zM3 6h6v1h-6zM4 7h4v1h-4zM5 8h2v1h-2z" />
          </svg>
          {SITE_NAME}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-purple-200">
          <Link to="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <a href="/#catalogo" className="hover:text-white transition-colors">
            Catálogo
          </a>
          <a href="/#como-funciona" className="hover:text-white transition-colors">
            Cómo funciona
          </a>
          <a href="/#preguntas" className="hover:text-white transition-colors">
            Preguntas
          </a>
          <a
            href="/#catalogo"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Crear mi regalo
          </a>
        </nav>

        <button
          type="button"
          className="md:hidden text-purple-200 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-purple-900/30 bg-slate-900/95 px-4 py-3 flex flex-col gap-3 text-sm text-purple-200">
          <Link to="/" className="hover:text-white" onClick={() => setMenuOpen(false)}>
            Inicio
          </Link>
          <a href="/#catalogo" className="hover:text-white" onClick={() => setMenuOpen(false)}>
            Catálogo
          </a>
          <a href="/#como-funciona" className="hover:text-white" onClick={() => setMenuOpen(false)}>
            Cómo funciona
          </a>
          <a href="/#preguntas" className="hover:text-white" onClick={() => setMenuOpen(false)}>
            Preguntas
          </a>
          <a
            href="/#catalogo"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-full text-center transition-colors"
          >
            Crear mi regalo
          </a>
        </nav>
      )}
    </header>
  )
}
