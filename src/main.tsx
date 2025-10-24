import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home-page'
import { ThemeProvider } from './contexts/theme-context'
import { ToastProvider } from './contexts/toast-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route index element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ToastProvider>
  </StrictMode>,
)
