import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 👈 IMPORTANTE
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* 👈 DEBE ENVOLVER A APP */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)