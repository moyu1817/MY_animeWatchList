const styles = {
  plan_to_watch: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  watching: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  dropped: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

import { STATUS_LABELS } from '../utils/watchlistStatus'

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md border ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
