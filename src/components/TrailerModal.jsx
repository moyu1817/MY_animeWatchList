import { useEffect, useRef } from 'react'
import { SAFE_EMBED } from '../utils/embed'

export function TrailerModal({ embedUrl, title, onClose }) {
  const isValid = SAFE_EMBED.test(embedUrl)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!isValid) return
    const wrap = wrapRef.current
    const focusable = wrap?.querySelectorAll('button, iframe, [tabindex]:not([tabindex="-1"])')
    const first = focusable?.[0]
    const last = focusable?.[focusable.length - 1]
    first?.focus()

    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isValid, onClose])

  if (!isValid) return null

  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm truncate pr-4">{title}</p>
          <button
            onClick={onClose}
            aria-label="Close trailer"
            className="text-zinc-400 hover:text-white text-2xl leading-none cursor-pointer shrink-0"
          >
            ×
          </button>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden border border-zinc-800">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
        <p className="text-center text-zinc-700 text-xs mt-3">Press Esc or click outside to close</p>
      </div>
    </div>
  )
}
