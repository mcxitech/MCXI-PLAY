export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Términos y Condiciones</h1>
      <div className="prose prose-invert prose-purple max-w-none text-purple-200 space-y-4 text-sm leading-relaxed">
        <h2 className="text-xl font-semibold text-white mt-6">Servicio</h2>
        <p>
          MCXI Play es una plataforma que ofrece videojuegos personalizados como regalos
          digitales. Al realizar una compra, usted acepta estos términos.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Producto</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cada compra corresponde a un juego personalizado accesible mediante un enlace exclusivo.</li>
          <li>El comprador puede solicitar una copia independiente (archivo ZIP) de su juego.</li>
          <li>La licencia otorgada es de uso personal. No se permite revender ni redistribuir los juegos.</li>
          <li>MCXI se reserva los derechos del motor de juego y el código fuente.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-6">Pagos</h2>
        <p>
          Los pagos se realizan mediante transferencia o depósito bancario. El pedido se activa
          una vez que el administrador verifica el pago. No se realizan cobros automáticos.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Cancelaciones</h2>
        <p>
          Puede solicitar la cancelación de un pedido antes de que el pago sea verificado.
          Una vez activado el regalo, no se aceptan devoluciones salvo en casos excepcionales.
        </p>
        <p className="text-purple-500 mt-8 text-xs">
          Última actualización: octubre 2026.
        </p>
      </div>
    </div>
  )
}
