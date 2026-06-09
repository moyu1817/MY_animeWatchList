import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFound() {
  usePageTitle('Page Not Found')
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 page-fade">
      <p className="text-8xl font-bold text-zinc-800 mb-4 select-none">404</p>
      <p className="text-white text-xl font-semibold mb-2">Page not found</p>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          Go Home
        </Link>
        <Link to="/featured" className="border border-zinc-700 text-zinc-400 hover:text-white px-5 py-2 rounded-md text-sm transition-colors">
          Browse Anime
        </Link>
      </div>
    </div>
  )
}
