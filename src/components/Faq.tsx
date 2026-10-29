import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: '¿Necesita instalar alguna app?',
    answer:
      'No. El regalo se abre directamente en el navegador del celular desde un enlace único. Sin descargas, sin registros y sin espacio ocupado.',
  },
  {
    question: '¿El enlace caduca?',
    answer:
      'No. Tu enlace sigue activo para que jueguen las veces que quieran. Además, como comprador recibes una copia descargable del juego para guardarla para siempre.',
  },
  {
    question: '¿Cómo puedo pagar?',
    answer:
      'Al solicitar tu pedido verás las formas de pago disponibles y los datos para pagar. En cuanto verifiquemos tu pago, te enviamos tu enlace.',
  },
  {
    question: '¿Puedo probarlo antes de comprar?',
    answer:
      'Sí. Cada juego tiene una demo gratuita que puedes jugar aquí mismo, sin compromiso, para ver exactamente cómo se siente la experiencia.',
  },
  {
    question: '¿Qué puedo personalizar?',
    answer:
      'Los nombres de ustedes dos, una dedicatoria secreta de hasta 200 caracteres y la temática: romántica, de cumpleaños o de amistad.',
  },
  {
    question: '¿En qué dispositivos funciona?',
    answer:
      'Se juega en el navegador del celular o de la computadora, sin instalar nada. Está pensado para jugarse en el celular de esa persona especial, donde recibe tu enlace.',
  },
]

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 text-purple-400 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto divide-y divide-purple-900/30">
      {FAQS.map((faq, i) => {
        const open = openIndex === i
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              aria-controls={`faq-panel-${i}`}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
              <span
                className={`font-semibold text-base md:text-lg transition-colors ${
                  open ? 'text-white' : 'text-purple-100 group-hover:text-white'
                }`}
              >
                {faq.question}
              </span>
              <PlusIcon open={open} />
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-purple-300 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
