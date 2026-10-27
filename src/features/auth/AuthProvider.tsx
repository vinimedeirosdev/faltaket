import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '@/lib/firebase'
import { CONFIG_PADRAO, observarPerfil, type Perfil } from './api'

interface AuthState {
  /** true até o Firebase dizer se há sessão salva */
  carregando: boolean
  user: User | null
  perfil: Perfil | null
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ carregando: true, user: null, perfil: null })

  useEffect(() => {
    let pararPerfil: (() => void) | undefined

    const pararAuth = onAuthStateChanged(auth, (user) => {
      pararPerfil?.()
      pararPerfil = undefined

      if (!user) {
        setState({ carregando: false, user: null, perfil: null })
        return
      }

      setState((s) => ({ ...s, carregando: false, user }))
      pararPerfil = observarPerfil(
        user.uid,
        (perfil) => setState((s) => ({ ...s, perfil })),
        (e) => console.error('Erro ao carregar perfil', e),
      )
    })

    return () => {
      pararAuth()
      pararPerfil?.()
    }
  }, [])

  return <AuthContext value={state}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

/** Para telas protegidas: garante que existe usuário logado. */
export function useUsuario() {
  const { user, perfil } = useAuth()
  if (!user) throw new Error('useUsuario usado fora de rota protegida')
  return {
    uid: user.uid,
    nome: perfil?.name ?? user.displayName ?? '',
    username: perfil?.username ?? '',
    foto: perfil?.foto,
    config: {
      mediaAprovacao: perfil?.config?.mediaAprovacao ?? CONFIG_PADRAO.mediaAprovacao,
      mediaExame: perfil?.config?.mediaExame,
      semestreInicio: perfil?.config?.semestreInicio,
      semestreFim: perfil?.config?.semestreFim,
      notificacoes: { ...CONFIG_PADRAO.notificacoes, ...perfil?.config?.notificacoes },
    },
    termo: perfil?.features?.termo === true,
  }
}
