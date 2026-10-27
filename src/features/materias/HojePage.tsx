import { AlertTriangle, BookOpen, CalendarClock, Clock, PartyPopper, Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { EmptyState, SecaoTitulo, Skeleton } from '@/components/ui/misc'
import { cn, primeiroNome } from '@/lib/utils'
import { Lista } from '../agenda/AgendaPage'
import { useEventos } from '../agenda/EventosProvider'
import { diasAte } from '../agenda/model'
import { useUsuario } from '../auth/AuthProvider'
import { MateriaCard } from './MateriaCard'
import { useMateriaModais } from './MateriaModaisProvider'
import { useMaterias } from './MateriasProvider'
import {
  aulaAgoraOuProxima,
  descreverHorario,
  diasDe,
  diaSemanaDe,
  faltasContadas,
  horariosNoDia,
  minutos,
  statusDa,
} from './model'

const dataHoje = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function HojePage() {
  const { nome } = useUsuario()
  const { materias, carregando } = useMaterias()
  const { eventos } = useEventos()
  const modais = useMateriaModais()

  const agora = new Date()
  const hoje = diaSemanaDe(agora)
  // aulas de hoje, na ordem do horário
  const deHoje = materias
    .filter((m) => diasDe(m).includes(hoje))
    .sort((a, b) => {
      const ia = horariosNoDia(a, hoje)[0]?.inicio
      const ib = horariosNoDia(b, hoje)[0]?.inicio
      return (ia ? minutos(ia) : 9999) - (ib ? minutos(ib) : 9999)
    })
  const emAtencao = materias.filter((m) => !diasDe(m).includes(hoje) && statusDa(m).tipo !== 'ok')
  const totalFaltas = materias.reduce((s, m) => s + faltasContadas(m.faltas), 0)
  const totalRisco = materias.filter((m) => statusDa(m).tipo !== 'ok').length
  const aula = aulaAgoraOuProxima(materias, agora)
  const semana = eventos
    .filter((e) => !e.concluido)
    .filter((e) => {
      const d = diasAte(e.data.toDate(), agora)
      return d >= 0 && d <= 7
    })
    .sort((a, b) => a.data.toMillis() - b.data.toMillis())

  return (
    <div className="grid grid-cols-1 gap-8">
      <section className="pt-2">
        <p className="text-muted-foreground text-sm first-letter:uppercase">
          {dataHoje.format(agora)}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {saudacao()}
          {nome && `, ${primeiroNome(nome)}`} 👋
        </h1>

        {aula && (
          <Link
            to={`/materias/${aula.materia.id}`}
            className="bg-primary text-primary-foreground shadow-primary/25 mt-5 flex items-center gap-3 rounded-2xl p-4 shadow-lg"
          >
            <Clock className="size-6 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide uppercase opacity-85">
                {aula.quando === 'agora' ? 'Acontecendo agora' : 'Próxima aula'}
              </p>
              <p className="truncate font-semibold">
                {aula.materia.nome}
                <span className="font-normal opacity-90"> · {descreverHorario(aula.horario)}</span>
              </p>
            </div>
          </Link>
        )}

        {!carregando && materias.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Resumo
              valor={materias.length}
              rotulo={materias.length === 1 ? 'matéria' : 'matérias'}
            />
            <Resumo valor={totalFaltas} rotulo={totalFaltas === 1 ? 'falta' : 'faltas'} />
            <Resumo
              valor={totalRisco}
              rotulo="em atenção"
              className={totalRisco > 0 ? 'bg-warn/15 text-warn border-warn/30' : undefined}
            />
          </div>
        )}
      </section>

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : materias.length === 0 ? (
        <EmptyState
          icone={<BookOpen />}
          titulo="Vamos começar?"
          descricao="Adicione suas matérias e o limite de faltas de cada uma. O FaltaKet avisa quando estiver chegando perto."
        >
          <Button onClick={modais.nova} className="mt-2">
            <Plus /> Adicionar primeira matéria
          </Button>
        </EmptyState>
      ) : (
        <>
          <section>
            <SecaoTitulo>Aulas de hoje</SecaoTitulo>
            {deHoje.length === 0 ? (
              <div className="bg-card flex items-center gap-4 rounded-3xl border p-5">
                <span className="bg-secondary text-primary grid size-12 shrink-0 place-items-center rounded-2xl">
                  <PartyPopper />
                </span>
                <div>
                  <p className="font-semibold">Sem aulas hoje</p>
                  <p className="text-muted-foreground text-sm">Aproveita para descansar 💖</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {deHoje.map((m) => (
                    <MateriaCard key={m.id} materia={m} dia={hoje} destaque />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {semana.length > 0 && (
            <section>
              <SecaoTitulo icone={<CalendarClock className="size-4" />}>
                Próximos 7 dias
              </SecaoTitulo>
              <Lista eventos={semana} />
              <Link
                to="/agenda"
                className="text-primary mt-3 inline-block text-sm font-semibold hover:underline"
              >
                Ver agenda completa →
              </Link>
            </section>
          )}

          {emAtencao.length > 0 && (
            <section>
              <SecaoTitulo icone={<AlertTriangle className="text-warn size-4" />}>
                Precisam de atenção
              </SecaoTitulo>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {emAtencao.map((m) => (
                    <MateriaCard key={m.id} materia={m} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          <Link
            to="/materias"
            className="text-primary justify-self-center text-sm font-semibold hover:underline"
          >
            Ver todas as matérias →
          </Link>
        </>
      )}
    </div>
  )
}

function Resumo({
  valor,
  rotulo,
  className,
}: {
  valor: number
  rotulo: string
  className?: string
}) {
  return (
    <div className={cn('bg-card rounded-2xl border px-3 py-3 text-center', className)}>
      <p className="text-2xl font-bold tabular-nums">{valor}</p>
      <p className="text-xs opacity-80">{rotulo}</p>
    </div>
  )
}
