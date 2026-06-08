const styles = {
  plan_to_watch: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  watching: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dropped: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const labels = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
