export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Aviso de Privacidad</h1>
      <div className="prose prose-invert prose-purple max-w-none text-purple-200 space-y-4 text-sm leading-relaxed">
        <p>
          <strong className="text-white">MCXI</strong> es responsable del tratamiento de los datos
          personales que usted proporcione al utilizar la plataforma MCXI Play.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Datos que recopilamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nombre y correo electrónico del comprador (al solicitar una compra).</li>
          <li>Nombres incluidos en la personalización del juego.</li>
          <li>Dedicatoria y preferencias visuales elegidas.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-6">Uso de los datos</h2>
        <p>
          Sus datos se utilizan exclusivamente para procesar su pedido, generar el juego
          personalizado y comunicarnos con usted respecto a su compra. No vendemos ni
          compartimos su información con terceros.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Contacto</h2>
        <p>
          Para ejercer sus derechos de acceso, rectificación, cancelación u oposición (ARCO),
          puede escribirnos a nuestro correo de contacto.
        </p>
        <p className="text-purple-500 mt-8 text-xs">
          Última actualización: octubre 2026.
        </p>
      </div>
    </div>
  )
}
