import { useToast } from '../context/ToastContext'

const styles = {
  success: 'border-emerald-500/30 text-emerald-400',
  remove:  'border-red-500/30 text-red-400',
  info:    'border-zinc-700 text-zinc-300',
}

export function Toast() {
  const { toasts, removeToast } = useToast()
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          role="status"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 border shadow-xl pointer-events-auto max-w-xs page-fade ${styles[type] ?? styles.info}`}
        >
          <span className="text-sm">{message}</span>
          <button
            onClick={() => removeToast(id)}
            aria-label="Dismiss notification"
            className="ml-auto text-zinc-600 hover:text-zinc-300 cursor-pointer leading-none text-lg shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
