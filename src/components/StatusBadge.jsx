import { STATUS_LABELS } from '../utils/watchlistStatus'

const styles = {
  plan_to_watch: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  watching:      'bg-green-500/10 text-green-400 border-green-500/20',
  completed:     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  dropped:       'bg-red-500/10 text-red-400 border-red-500/20',
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md border ${styles[status] ?? ''}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
