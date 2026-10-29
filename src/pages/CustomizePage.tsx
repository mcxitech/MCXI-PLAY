import { useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PhaserGame from '@/components/PhaserGame'
import { formatPriceMXN } from '@/lib/constants'
import { useTemplates } from '@/lib/useTemplates'
import { sanitizeText, LIMITS } from '@/lib/sanitize'
import { api } from '@/lib/api'
import type { GameConfig } from '@/game/config'
import { DEFAULT_CONFIG } from '@/game/config'

const THEMES: { value: GameConfig['theme']; label: string }[] = [
  { value: 'romantic', label: 'Romántico' },
  { value: 'birthday', label: 'Cumpleaños' },
  { value: 'friendship', label: 'Amistad' },
]

const COLOR_PRESETS: { label: string; primary: string; secondary: string }[] = [
  { label: 'Rosa / Púrpura', primary: '#e91e63', secondary: '#9c27b0' },
  { label: 'Rojo / Dorado', primary: '#d32f2f', secondary: '#ff8f00' },
  { label: 'Azul / Cian', primary: '#1976d2', secondary: '#00bcd4' },
  { label: 'Verde / Lima', primary: '#388e3c', secondary: '#cddc39' },
]

type Step = 'form' | 'preview' | 'summary'

export default function CustomizePage() {
  const { slug } = useParams<{ slug: string }>()
  const { templates, loading } = useTemplates()
  const game = templates.find((g) => g.slug === slug)

  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [dedication, setDedication] = useState('')
  const [theme, setTheme] = useState<GameConfig['theme']>('romantic')
  const [primaryColor, setPrimaryColor] = useState('#e91e63')
  const [secondaryColor, setSecondaryColor] = useState('#9c27b0')
  const [step, setStep] = useState<Step>('form')
  const [previewKey, setPreviewKey] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const gameConfig = useMemo<GameConfig>(
    () => ({
      recipientName: sanitizeText(recipientName, LIMITS.recipientName) || DEFAULT_CONFIG.recipientName,
      senderName: sanitizeText(senderName, LIMITS.senderName) || DEFAULT_CONFIG.senderName,
      dedication: sanitizeText(dedication, LIMITS.dedication) || DEFAULT_CONFIG.dedication,
      theme,
      primaryColor,
      secondaryColor,
    }),
    [recipientName, senderName, dedication, theme, primaryColor, secondaryColor],
  )

  const isValid =
    recipientName.trim().length > 0 &&
    senderName.trim().length > 0 &&
    dedication.trim().length > 0

  const buyerValid = buyerName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())

  const submitOrder = async () => {
    if (!game || !isValid || !buyerValid || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await api.createOrder({
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        templateSlug: game.slug,
        personalization: gameConfig,
      })
      navigate(`/pedido/${order.orderNumber}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar el pedido')
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-center text-purple-300 py-20">Cargando...</p>

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Juego no encontrado</h1>
        <Link to="/" className="text-purple-400 hover:text-purple-300 underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <Link to={`/juego/${game.slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">
        ← Volver a {game.name}
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Personaliza tu regalo
      </h1>
      <p className="text-purple-300 mb-8 text-sm">
        {game.name} — {formatPriceMXN(game.priceMxn)}
      </p>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {(['form', 'preview', 'summary'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-purple-800" />}
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-purple-400 border border-purple-800'
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? 'text-white' : 'text-purple-500'}>
              {s === 'form' ? 'Personalizar' : s === 'preview' ? 'Vista previa' : 'Resumen'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Form */}
      {step === 'form' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <Field
              label="Nombre del destinatario"
              value={recipientName}
              onChange={(v) => setRecipientName(sanitizeText(v, LIMITS.recipientName))}
              maxLength={LIMITS.recipientName}
              placeholder="¿Para quién es el regalo?"
              required
            />
            <Field
              label="Tu nombre (remitente)"
              value={senderName}
              onChange={(v) => setSenderName(sanitizeText(v, LIMITS.senderName))}
              maxLength={LIMITS.senderName}
              placeholder="¿De parte de quién?"
              required
            />
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Dedicatoria <span className="text-purple-500">({dedication.length}/{LIMITS.dedication})</span>
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(sanitizeText(e.target.value, LIMITS.dedication))}
                maxLength={LIMITS.dedication}
                rows={3}
                placeholder="Escribe un mensaje especial..."
                className="w-full bg-slate-800 border border-purple-900/50 rounded-lg px-3 py-2 text-white placeholder-purple-600 text-sm focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Temática</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      theme === t.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-purple-300 border border-purple-900/50 hover:border-purple-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Colores</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(p.primary)
                      setSecondaryColor(p.secondary)
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${
                      primaryColor === p.primary && secondaryColor === p.secondary
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-purple-300 border border-purple-900/50 hover:border-purple-600'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: p.primary }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: p.secondary }} />
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-purple-400">
                  Principal
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-purple-400">
                  Secundario
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live config preview card */}
          <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-5 h-fit">
            <h3 className="text-white font-semibold mb-3">Tu regalo incluirá:</h3>
            <dl className="space-y-2 text-sm">
              <ConfigRow label="Para" value={gameConfig.recipientName} />
              <ConfigRow label="De" value={gameConfig.senderName} />
              <ConfigRow label="Dedicatoria" value={gameConfig.dedication} />
              <ConfigRow label="Temática" value={THEMES.find((t) => t.value === theme)?.label ?? theme} />
              <ConfigRow
                label="Colores"
                value={
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full inline-block" style={{ background: primaryColor }} />
                    <span className="w-4 h-4 rounded-full inline-block" style={{ background: secondaryColor }} />
                  </span>
                }
              />
            </dl>
            <button
              type="button"
              disabled={!isValid}
              onClick={() => {
                setPreviewKey((k) => k + 1)
                setStep('preview')
              }}
              className="mt-5 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-purple-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {isValid ? 'Ver vista previa' : 'Completa todos los campos'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          <div className="w-full lg:w-auto lg:shrink-0 lg:h-[calc(100vh-12rem)] lg:aspect-[2/3]">
            <PhaserGame key={previewKey} config={gameConfig} className="w-full h-full max-w-[400px] mx-auto lg:mx-0" />
          </div>
          <div className="flex-1 min-w-0 lg:py-4 space-y-4">
            <p className="text-purple-300 text-sm">
              Así se verá el juego para <strong className="text-white">{gameConfig.recipientName}</strong>.
              Esta es una vista previa — el juego comprado tendrá un enlace exclusivo.
            </p>
            <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2 text-sm">Tu personalización:</h3>
              <dl className="space-y-1.5 text-sm">
                <ConfigRow label="Para" value={gameConfig.recipientName} />
                <ConfigRow label="De" value={gameConfig.senderName} />
                <ConfigRow label="Dedicatoria" value={`"${gameConfig.dedication}"`} />
                <ConfigRow label="Temática" value={THEMES.find((t) => t.value === theme)?.label ?? theme} />
                <ConfigRow
                  label="Colores"
                  value={
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ background: primaryColor }} />
                      <span className="w-4 h-4 rounded-full inline-block" style={{ background: secondaryColor }} />
                    </span>
                  }
                />
              </dl>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="border border-purple-600 text-purple-300 hover:bg-purple-900/30 font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setStep('summary')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Continuar a resumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Summary */}
      {step === 'summary' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-slate-800/60 border border-purple-900/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Resumen de tu pedido</h2>
            <div className="border-t border-purple-900/30 pt-4 space-y-2 text-sm">
              <ConfigRow label="Juego" value={game.name} />
              <ConfigRow label="Para" value={gameConfig.recipientName} />
              <ConfigRow label="De" value={gameConfig.senderName} />
              <ConfigRow label="Dedicatoria" value={`"${gameConfig.dedication}"`} />
              <ConfigRow label="Temática" value={THEMES.find((t) => t.value === theme)?.label ?? theme} />
              <ConfigRow
                label="Colores"
                value={
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full inline-block" style={{ background: primaryColor }} />
                    <span className="w-4 h-4 rounded-full inline-block" style={{ background: secondaryColor }} />
                  </span>
                }
              />
            </div>
            <div className="border-t border-purple-900/30 pt-4 flex justify-between items-center">
              <span className="text-purple-300">Total</span>
              <span className="text-2xl font-bold text-purple-400">{formatPriceMXN(game.priceMxn)}</span>
            </div>
            <div className="border-t border-purple-900/30 pt-4 space-y-4">
              <h3 className="text-white font-semibold text-sm">Tus datos de contacto</h3>
              <Field
                label="Tu nombre completo"
                value={buyerName}
                onChange={(v) => setBuyerName(sanitizeText(v, 60))}
                maxLength={60}
                placeholder="Para identificar tu pago"
                required
              />
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Tu email</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value.slice(0, 120))}
                  maxLength={120}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  required
                  className="w-full bg-slate-800 border border-purple-900/50 rounded-lg px-3 py-2 text-white placeholder-purple-600 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to={`/personalizar/${game.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  setStep('preview')
                }}
                className="border border-purple-600 text-purple-300 hover:bg-purple-900/30 font-semibold py-2.5 rounded-xl text-center transition-colors"
              >
                Volver a vista previa
              </Link>
              {submitError && <p className="text-sm text-red-400 text-center">{submitError}</p>}
              <button
                type="button"
                disabled={!buyerValid || submitting}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-purple-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
                onClick={submitOrder}
              >
                {submitting
                  ? 'Registrando pedido...'
                  : buyerValid
                    ? `Solicitar compra — ${formatPriceMXN(game.priceMxn)}`
                    : 'Escribe tu nombre y email'}
              </button>
              <p className="text-xs text-purple-500 text-center">
                Al solicitar la compra recibirás instrucciones de pago. No se realiza ningún cobro automático.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-purple-200 mb-1">
        {label} <span className="text-purple-500">({value.length}/{maxLength})</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-800 border border-purple-900/50 rounded-lg px-3 py-2 text-white placeholder-purple-600 text-sm focus:outline-none focus:border-purple-500"
      />
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-purple-400 shrink-0">{label}</dt>
      <dd className="text-white text-right">{value}</dd>
    </div>
  )
}
