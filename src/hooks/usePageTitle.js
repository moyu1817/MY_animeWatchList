import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — MoMoAnime!` : 'MoMoAnime!'
    return () => { document.title = 'MoMoAnime!' }
  }, [title])
}
