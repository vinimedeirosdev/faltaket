import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'
import { LogoCompleta } from '@/components/brand'
import { useAuth, useUsuario } from '@/features/auth/AuthProvider'
import { CadastroPage } from '@/features/auth/CadastroPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { HojePage } from '@/features/materias/HojePage'
import { MateriasPage } from '@/features/materias/MateriasPage'
import { PerfilPage } from '@/features/perfil/PerfilPage'
import { AppLayout } from './AppLayout'

// a carta só é baixada por quem pode vê-la
const TermoPage = lazy(() =>
  import('@/features/termo/TermoPage').then((m) => ({ default: m.TermoPage })),
)

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LogoCompleta className="w-44 animate-pulse" />
    </div>
  )
}

/** Só deixa passar quem está logado; senão, manda para o login. */
function RequireAuth() {
  const { carregando, user } = useAuth()
  const location = useLocation()
  if (carregando) return <Splash />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Login/cadastro: quem já está logado volta para onde queria ir. */
function SomenteVisitante() {
  const { carregando, user } = useAuth()
  const location = useLocation()
  if (carregando) return <Splash />
  if (user) {
    const destino = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={destino} replace />
  }
  return <Outlet />
}

function RequireTermo({ children }: { children: ReactNode }) {
  const { termo } = useUsuario()
  const { perfil } = useAuth()
  if (!perfil) return <Splash /> // perfil ainda carregando
  if (!termo) return <Navigate to="/" replace />
  return <Suspense fallback={<Splash />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <SomenteVisitante />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <CadastroPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HojePage /> },
          { path: '/materias', element: <MateriasPage /> },
          { path: '/perfil', element: <PerfilPage /> },
        ],
      },
      {
        path: '/termo',
        element: (
          <RequireTermo>
            <TermoPage />
          </RequireTermo>
        ),
      },
    ],
  },
  // rotas antigas da v1 → novas
  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '/profile', element: <Navigate to="/perfil" replace /> },
  { path: '/register', element: <Navigate to="/cadastro" replace /> },
  { path: '/termos', element: <Navigate to="/termo" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
