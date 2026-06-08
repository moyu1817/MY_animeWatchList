import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-base leading-none"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
