import { useState } from 'react'

export default function CopyButton({ text, label = 'Copiar', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (http, old browsers); the text stays visible to copy by hand
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={className ?? 'bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0'}
    >
      {copied ? '¡Copiado!' : label}
    </button>
  )
}
