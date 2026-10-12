import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeGoogleAnalytics } from './utils/googleAnalytics'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import App from './App.tsx'

initializeGoogleAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
