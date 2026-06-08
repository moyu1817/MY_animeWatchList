import { useEffect } from 'react'

export function TrailerModal({ embedUrl, title, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm truncate pr-4">{title}</p>
          <button
            onClick={onClose}
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
          />
        </div>
        <p className="text-center text-zinc-700 text-xs mt-3">Press Esc or click outside to close</p>
      </div>
    </div>
  )
}
