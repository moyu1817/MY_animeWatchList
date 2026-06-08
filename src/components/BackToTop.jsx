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
      className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-500 text-white w-11 h-11 rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all duration-200 cursor-pointer text-lg hover:scale-110"
      title="Back to top"
      aria-label="Back to top"
    >
      ↑
    </button>
  )
}
