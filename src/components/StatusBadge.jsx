import { STATUS_LABELS } from '../utils/watchlistStatus'

const styles = {
  plan_to_watch: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  watching:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed:     'bg-violet-500/10 text-violet-400 border-violet-500/20',
  dropped:       'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md border ${styles[status] ?? ''}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
