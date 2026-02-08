// Sentry должен быть первым!
import { initSentry } from './lib/sentry';
initSentry();

// Initialize PostHog analytics
import { initPostHog } from './lib/posthog';
initPostHog();

import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import './i18n/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LotteryErrorCatcher } from './components/LotteryErrorCatcher'
import { ThemeProvider } from './context/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LotteryErrorCatcher fallbackMessage="We encountered an issue loading the lottery app. Please try again.">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </LotteryErrorCatcher>
    </ThemeProvider>
  </StrictMode>,
)