import { useState, useEffect } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-400 text-black w-11 h-11 rounded-full shadow-lg shadow-emerald-900/30 flex items-center justify-center transition-all duration-200 cursor-pointer text-lg font-bold hover:scale-110"
      title="Back to top"
      aria-label="Back to top"
    >
      ↑
    </button>
  )
}
