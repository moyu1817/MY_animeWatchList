import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime:    1000 * 60 * 30,
      retry: (failureCount, error) => {
        if (error?.response?.status === 429) return failureCount < 1
        return failureCount < 2
      },
      retryDelay: (attemptIndex, error) => {
        if (error?.response?.status === 429) return 5000
        return Math.min(1000 * (attemptIndex + 1), 6000)
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
