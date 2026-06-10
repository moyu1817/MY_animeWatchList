import { useState, useEffect } from 'react'

export function RateLimitBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer
    function show() {
      setVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setVisible(false), 8000)
    }
    window.addEventListener('api:rate-limited', show)
    return () => { window.removeEventListener('api:rate-limited', show); clearTimeout(timer) }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-yellow-500/40 text-yellow-400 text-xs px-4 py-2.5 rounded-md shadow-xl flex items-center gap-2 animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      API rate limit reached — retrying automatically in a moment
      <button onClick={() => setVisible(false)} aria-label="Dismiss" className="ml-1 text-yellow-600 hover:text-yellow-300 cursor-pointer leading-none">×</button>
    </div>
  )
}
