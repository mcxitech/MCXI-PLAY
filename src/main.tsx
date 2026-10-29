import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (OFL-1.1): no requests to third parties (see D022)
import '@fontsource-variable/baloo-2'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
