import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useUsuario } from '../auth/AuthProvider'
import { observarEventos } from './api'
import type { Evento } from './model'

interface EventosState {
  carregando: boolean
  eventos: Evento[]
}

const EventosContext = createContext<EventosState | null>(null)

/** Uma assinatura em tempo real dos eventos (provas/entregas), igual ao MateriasProvider. */
export function EventosProvider({ children }: { children: ReactNode }) {
  const { uid } = useUsuario()
  const [state, setState] = useState<EventosState>({ carregando: true, eventos: [] })

  useEffect(() => {
    return observarEventos(
      uid,
      (eventos) => setState({ carregando: false, eventos }),
      (e) => {
        console.error(e)
        toast.error('Não foi possível carregar sua agenda.')
        setState((s) => ({ ...s, carregando: false }))
      },
    )
  }, [uid])

  return <EventosContext value={state}>{children}</EventosContext>
}

export function useEventos() {
  const ctx = useContext(EventosContext)
  if (!ctx) throw new Error('useEventos precisa estar dentro de <EventosProvider>')
  return ctx
}
