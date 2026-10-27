import { CalendarHeart, Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState, SecaoTitulo, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useAgendaModais } from './AgendaModaisProvider'
import { EventoItem } from './EventoItem'
import { useEventos } from './EventosProvider'
import { agrupar, TIPO_INFO, TIPOS, type Evento, type TipoEvento } from './model'

export function AgendaPage() {
  const { eventos, carregando } = useEventos()
  const modais = useAgendaModais()
  const [filtro, setFiltro] = useState<TipoEvento | null>(null)
  const [verConcluidos, setVerConcluidos] = useState(false)

  const visiveis = filtro ? eventos.filter((e) => e.tipo === filtro) : eventos
  const g = agrupar(visiveis, new Date())

  return (
    <div className="grid grid-cols-1 gap-6 pt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground text-sm">Provas, trabalhos e entregas</p>
        </div>
        <Button onClick={() => modais.novo()} variant="secondary" className="hidden sm:inline-flex">
          <Plus /> Adicionar
        </Button>
      </div>

      {/* filtro por tipo */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar">
        <Chip ativo={filtro === null} onClick={() => setFiltro(null)}>
          Tudo
        </Chip>
        {TIPOS.map((t) => (
          <Chip key={t} ativo={filtro === t} onClick={() => setFiltro(filtro === t ? null : t)}>
            {TIPO_INFO[t].emoji} {TIPO_INFO[t].nome}
          </Chip>
        ))}
      </div>

      {carregando ? (
        <div className="grid gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : visiveis.length === 0 ? (
        <EmptyState
          icone={<CalendarHeart />}
          titulo="Nada na agenda"
          descricao="Adicione provas, trabalhos e entregas para nunca perder um prazo."
        >
          <Button onClick={() => modais.novo()} className="mt-2">
            <Plus /> Adicionar
          </Button>
        </EmptyState>
      ) : (
        <>
          <Grupo titulo="Atrasados" eventos={g.atrasados} destaque />
          <Grupo titulo="Próximos 7 dias" eventos={g.semana} />
          <Grupo titulo="Mais pra frente" eventos={g.proximos} />
          {g.atrasados.length + g.semana.length + g.proximos.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Tudo em dia! Nada pendente. ✨
            </p>
          )}
          {g.concluidos.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setVerConcluidos((v) => !v)}
                className="text-primary text-sm font-semibold"
              >
                {verConcluidos ? 'Esconder' : 'Ver'} concluídos ({g.concluidos.length})
              </button>
              {verConcluidos && <Lista eventos={g.concluidos} className="mt-3" />}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Grupo({
  titulo,
  eventos,
  destaque,
}: {
  titulo: string
  eventos: Evento[]
  destaque?: boolean
}) {
  if (eventos.length === 0) return null
  return (
    <section>
      <SecaoTitulo>
        <span className={cn(destaque && 'text-danger')}>{titulo}</span>
      </SecaoTitulo>
      <Lista eventos={eventos} />
    </section>
  )
}

export function Lista({
  eventos,
  semMateria,
  className,
}: {
  eventos: Evento[]
  semMateria?: boolean
  className?: string
}) {
  return (
    <ul className={cn('grid gap-2 lg:grid-cols-2', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {eventos.map((e) => (
          <EventoItem key={e.id} evento={e} semMateria={semMateria} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-colors',
        ativo ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
