import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        // Never retry on 401, 403, 404, 429
        if ([401, 403, 404, 429].includes(status)) {
          return false;
        }
        // Only retry on 500, 502, 503, 504
        if ([500, 502, 503, 504].includes(status)) {
          return failureCount < 3;
        }
        return false;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
