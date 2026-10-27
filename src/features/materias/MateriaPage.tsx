import { ArrowLeft, CalendarX2, Clock, Mail, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useAgendaModais } from '../agenda/AgendaModaisProvider'
import { Lista } from '../agenda/AgendaPage'
import { useEventos } from '../agenda/EventosProvider'
import { NotasMateria } from '../notas/NotasMateria'
import { BotoesFalta } from './BotoesFalta'
import { Historico } from './Historico'
import { useMateriaModais } from './MateriaModaisProvider'
import { useMaterias } from './MateriasProvider'
import {
  COR_CLASSES,
  DIAS,
  descreverHorario,
  horariosDe,
  STATUS_CLASSES,
  statusDa,
  type Materia,
} from './model'
import { ProgressRing } from './ProgressRing'

export function MateriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { materias, carregando } = useMaterias()
  const materia = materias.find((m) => m.id === id)

  // excluída (aqui ou em outro aparelho) ou link inválido: volta para a lista
  useEffect(() => {
    if (!carregando && !materia) navigate('/materias', { replace: true })
  }, [carregando, materia, navigate])

  if (!materia) {
    return (
      <div className="grid gap-4 pt-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  return <Conteudo materia={materia} />
}

const ABAS = [
  { valor: 'faltas', rotulo: 'Faltas' },
  { valor: 'notas', rotulo: 'Notas' },
  { valor: 'agenda', rotulo: 'Agenda' },
  { valor: 'info', rotulo: 'Info' },
]

function Conteudo({ materia }: { materia: Materia }) {
  const status = statusDa(materia)
  const cor = COR_CLASSES[materia.cor] ?? COR_CLASSES.violet
  const st = STATUS_CLASSES[status.tipo]
  const modais = useMateriaModais()

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5 pt-2">
      <Link
        to="/materias"
        className="text-muted-foreground hover:text-foreground -ml-1 flex items-center gap-1 justify-self-start p-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Matérias
      </Link>

      {/* cabeçalho */}
      <section className="bg-card relative overflow-hidden rounded-3xl border p-5 shadow-sm">
        <span className={cn('absolute inset-x-0 top-0 h-1.5', cor.dot)} aria-hidden />
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl leading-tight font-bold">{materia.nome}</h1>
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                st.bg,
                st.text,
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {status.mensagem}
            </span>
          </div>
          <ProgressRing status={status} max={materia.maxFaltas} size={72} />
        </div>
        <BotoesFalta materia={materia} className="mt-4" />
      </section>

      <Tabs.Root defaultValue="faltas" className="grid gap-4">
        <Tabs.List
          aria-label="Seções da matéria"
          className="bg-muted grid grid-cols-4 gap-1 rounded-2xl p-1"
        >
          {ABAS.map((a) => (
            <Tabs.Trigger
              key={a.valor}
              value={a.valor}
              className="text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground h-10 rounded-xl text-sm font-semibold transition-colors data-[state=active]:shadow-sm"
            >
              {a.rotulo}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="faltas">
          <Historico materia={materia} />
        </Tabs.Content>
        <Tabs.Content value="notas">
          <NotasMateria key={materia.id} materia={materia} />
        </Tabs.Content>
        <Tabs.Content value="agenda">
          <AgendaDaMateria materia={materia} />
        </Tabs.Content>
        <Tabs.Content value="info">
          <Info materia={materia} />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => modais.editar(materia)}>
              <Pencil /> Editar
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => modais.excluir(materia)}
            >
              <Trash2 /> Excluir
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function AgendaDaMateria({ materia }: { materia: Materia }) {
  const { eventos } = useEventos()
  const agenda = useAgendaModais()
  const daMateria = eventos
    .filter((e) => e.materiaId === materia.id)
    .sort(
      (a, b) => Number(a.concluido) - Number(b.concluido) || a.data.toMillis() - b.data.toMillis(),
    )

  return (
    <div className="grid gap-3">
      <Button variant="outline" onClick={() => agenda.novo({ materiaId: materia.id })}>
        <Plus /> Nova prova ou entrega
      </Button>
      {daMateria.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          Nenhuma prova ou entrega desta matéria ainda.
        </p>
      ) : (
        <Lista eventos={daMateria} semMateria />
      )}
    </div>
  )
}

function Info({ materia }: { materia: Materia }) {
  const horarios = [...horariosDe(materia)].sort(
    (a, b) => a.dia - b.dia || (a.inicio ?? '').localeCompare(b.inicio ?? ''),
  )
  return (
    <div className="bg-card divide-y rounded-2xl border">
      {horarios.map((h, i) => (
        <Linha key={i} icone={<Clock />}>
          <span className="font-medium">{DIAS.find((d) => d.valor === h.dia)?.nome}</span>
          {descreverHorario(h) && (
            <span className="text-muted-foreground block text-sm">{descreverHorario(h)}</span>
          )}
        </Linha>
      ))}
      <Linha icone={<CalendarX2 />}>
        <span className="font-medium">Limite de faltas</span>
        <span className="text-muted-foreground block text-sm">
          {materia.maxFaltas} {materia.maxFaltas === 1 ? 'falta' : 'faltas'}
        </span>
      </Linha>
      {materia.professor && (
        <Linha icone={<UserRound />}>
          <span className="font-medium">{materia.professor.nome}</span>
          {materia.professor.email && (
            <a
              href={`mailto:${materia.professor.email}`}
              className="text-primary flex items-center gap-1 text-sm font-medium"
            >
              <Mail className="size-3.5" /> {materia.professor.email}
            </a>
          )}
        </Linha>
      )}
    </div>
  )
}

function Linha({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0">
      <span className="text-muted-foreground mt-0.5 [&>svg]:size-5">{icone}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
