import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ← обязательно
import './index.css'
import App from './App.tsx'
import './i18n/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> {/* ← это решает useRoutes */}
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)