import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useMediaQuery } from '@/lib/use-media-query'

export type Tema = 'system' | 'light' | 'dark'
const CHAVE = 'faltaket:theme' // também lida no index.html para evitar "piscar"

function lerTema(): Tema {
  try {
    const t = localStorage.getItem(CHAVE)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

const Ctx = createContext<{ tema: Tema; setTema: (t: Tema) => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(lerTema)
  const sistemaEscuro = useMediaQuery('(prefers-color-scheme: dark)')
  const escuro = tema === 'dark' || (tema === 'system' && sistemaEscuro)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', escuro)
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', escuro ? '#120d1f' : '#faf7ff')
    })
  }, [escuro])

  function setTema(t: Tema) {
    setTemaState(t)
    try {
      if (t === 'system') localStorage.removeItem(CHAVE)
      else localStorage.setItem(CHAVE, t)
    } catch {
      // navegação privada: o tema só não fica salvo
    }
  }

  return <Ctx value={{ tema, setTema }}>{children}</Ctx>
}

export function useTema() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTema precisa estar dentro de <ThemeProvider>')
  return ctx
}
