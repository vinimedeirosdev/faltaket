import { AlertTriangle, BookOpen, PartyPopper, Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { EmptyState, Skeleton } from '@/components/ui/misc'
import { cn, primeiroNome } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { MateriaCard } from './MateriaCard'
import { useMateriaModais } from './MateriaModaisProvider'
import { useMaterias } from './MateriasProvider'
import { calcularStatus, diaSemanaDe } from './model'

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
  const modais = useMateriaModais()

  const hoje = diaSemanaDe(new Date())
  const deHoje = materias.filter((m) => m.diaSemana === hoje)
  const emAtencao = materias.filter(
    (m) => m.diaSemana !== hoje && calcularStatus(m.faltas.length, m.maxFaltas).tipo !== 'ok',
  )
  const totalFaltas = materias.reduce((s, m) => s + m.faltas.length, 0)
  const totalRisco = materias.filter(
    (m) => calcularStatus(m.faltas.length, m.maxFaltas).tipo !== 'ok',
  ).length

  return (
    <div className="grid gap-8">
      <section className="pt-2">
        <p className="text-muted-foreground text-sm first-letter:uppercase">
          {dataHoje.format(new Date())}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {saudacao()}
          {nome && `, ${primeiroNome(nome)}`} 👋
        </h1>

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
          descricao="Adicione suas matérias e o limite de faltas de cada uma. O Faltaket avisa quando estiver chegando perto."
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
                  <p className="text-muted-foreground text-sm">Aproveita para descansar 💜</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {deHoje.map((m) => (
                    <MateriaCard key={m.id} materia={m} destaque />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

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

export function SecaoTitulo({
  children,
  icone,
}: {
  children: React.ReactNode
  icone?: React.ReactNode
}) {
  return (
    <h2 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
      {icone}
      {children}
    </h2>
  )
}
