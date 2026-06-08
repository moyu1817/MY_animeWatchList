import { useEffect } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.1 })

export function LoadingBar() {
  const isFetching = useIsFetching()

  useEffect(() => {
    if (isFetching > 0) {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [isFetching])

  return null
}
