import '@fontsource-variable/inter'
import '@fontsource/caveat/700.css'
import '@fontsource/dancing-script/600.css'
import './styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from 'sonner'
import { router } from './app/router'
import { ThemeProvider, useTema } from './app/ThemeProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import { AvisoAtualizacao } from './features/pwa/pwa'

function Toasts() {
  const { tema } = useTema()
  return (
    <Toaster
      theme={tema}
      position="top-center"
      richColors
      closeButton
      offset={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
      toastOptions={{ className: 'rounded-2xl!' }}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toasts />
        <AvisoAtualizacao />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
