import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useUsuario } from '../auth/AuthProvider'
import { observarMaterias } from './api'
import { ordenarMaterias, type Materia } from './model'

interface MateriasState {
  carregando: boolean
  materias: Materia[]
}

const MateriasContext = createContext<MateriasState | null>(null)

/** Uma única assinatura em tempo real das matérias, compartilhada pelas telas. */
export function MateriasProvider({ children }: { children: ReactNode }) {
  const { uid } = useUsuario()
  const [state, setState] = useState<MateriasState>({ carregando: true, materias: [] })

  useEffect(() => {
    return observarMaterias(
      uid,
      (materias) => setState({ carregando: false, materias }),
      (e) => {
        console.error(e)
        toast.error('Não foi possível carregar suas matérias.')
        setState((s) => ({ ...s, carregando: false }))
      },
    )
  }, [uid])

  const value = useMemo(() => ({ ...state, materias: ordenarMaterias(state.materias) }), [state])

  return <MateriasContext value={value}>{children}</MateriasContext>
}

export function useMaterias() {
  const ctx = useContext(MateriasContext)
  if (!ctx) throw new Error('useMaterias precisa estar dentro de <MateriasProvider>')
  return ctx
}
