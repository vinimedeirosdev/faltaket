import { BookOpen, CalendarCheck, Plus, UserRound } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { MarcaIcone } from '@/components/brand'
import { Avatar, Logo } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useUsuario } from '@/features/auth/AuthProvider'
import { MateriaModaisProvider, useMateriaModais } from '@/features/materias/MateriaModaisProvider'
import { MateriasProvider } from '@/features/materias/MateriasProvider'

const NAV = [
  { to: '/', label: 'Hoje', icon: CalendarCheck },
  { to: '/materias', label: 'Matérias', icon: BookOpen },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

export function AppLayout() {
  return (
    <MateriasProvider>
      <MateriaModaisProvider>
        <Shell />
      </MateriaModaisProvider>
    </MateriasProvider>
  )
}

function Shell() {
  const { nome, foto } = useUsuario()
  const modais = useMateriaModais()
  const { pathname } = useLocation()

  return (
    <div className="relative min-h-dvh">
      {/* brilho decorativo no topo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 -top-40 -z-10 mx-auto h-80 max-w-3xl rounded-full bg-gradient-to-r from-violet-400/30 via-fuchsia-300/25 to-pink-300/30 blur-3xl dark:from-violet-600/20 dark:via-fuchsia-500/10 dark:to-pink-500/15"
      />

      <header className="pt-safe bg-background/70 sticky top-0 z-30 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" aria-label="Início" className="flex items-center gap-2.5">
            <MarcaIcone className="size-9" />
            <Logo className="text-3xl" />
          </Link>

          {/* navegação no desktop */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Principal">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <n.icon className="size-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/perfil" aria-label="Perfil" className="sm:hidden">
            <Avatar nome={nome} foto={foto} className="size-9" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-2 pb-36 sm:pb-16">
        <Outlet />
      </main>

      {/* FAB: nova matéria (no perfil não faz sentido e cobriria os controles) */}
      {pathname !== '/perfil' && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={modais.nova}
          aria-label="Adicionar matéria"
          className="bg-primary text-primary-foreground shadow-primary/40 fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 grid size-14 place-items-center rounded-2xl shadow-lg sm:right-8 sm:bottom-8"
        >
          <Plus className="size-7" />
        </motion.button>
      )}

      {/* bottom navigation (mobile) */}
      <nav
        aria-label="Principal"
        className="pb-safe bg-background/85 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-xl sm:hidden"
      >
        <div className="grid grid-cols-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-full transition-colors',
                      isActive && 'bg-secondary',
                    )}
                  >
                    <n.icon className="size-5" />
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
