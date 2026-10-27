import { BookOpen, Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { EmptyState, SecaoTitulo, Skeleton } from '@/components/ui/misc'
import { useUsuario } from '../auth/AuthProvider'
import { calcularNotas, formatarNota } from '../notas/calculo'
import { MateriaCard } from './MateriaCard'
import { useMateriaModais } from './MateriaModaisProvider'
import { useMaterias } from './MateriasProvider'
import { DIAS, diasDe, diaSemanaDe, horariosNoDia, minutos } from './model'

export function MateriasPage() {
  const { materias, carregando } = useMaterias()
  const modais = useMateriaModais()
  const { config } = useUsuario()
  const hoje = diaSemanaDe(new Date())

  const grupos = DIAS.map((d) => ({
    ...d,
    // matéria com aula em mais de um dia aparece em cada um deles, na ordem do horário
    materias: materias
      .filter((m) => diasDe(m).includes(d.valor))
      .sort((a, b) => {
        const ia = horariosNoDia(a, d.valor)[0]?.inicio
        const ib = horariosNoDia(b, d.valor)[0]?.inicio
        return (ia ? minutos(ia) : 9999) - (ib ? minutos(ib) : 9999)
      }),
  })).filter((g) => g.materias.length > 0)

  // média geral do semestre: média simples das médias das matérias com nota
  const medias = materias
    .map((m) => calcularNotas(m.notas ?? [], m.mediaAprovacao ?? config.mediaAprovacao).media)
    .filter((x): x is number => x !== null)
  const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null

  return (
    <div className="grid grid-cols-1 gap-8 pt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matérias</h1>
          <p className="text-muted-foreground text-sm">
            Organizadas por dia da semana
            {mediaGeral !== null && (
              <>
                {' · '}média geral{' '}
                <strong className="text-foreground">{formatarNota(mediaGeral)}</strong>
              </>
            )}
          </p>
        </div>
        <Button onClick={modais.nova} variant="secondary" className="hidden sm:inline-flex">
          <Plus /> Nova matéria
        </Button>
      </div>

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState
          icone={<BookOpen />}
          titulo="Nenhuma matéria ainda"
          descricao="Toque no + para adicionar a primeira."
        >
          <Button onClick={modais.nova} className="mt-2">
            <Plus /> Adicionar matéria
          </Button>
        </EmptyState>
      ) : (
        grupos.map((g) => (
          <section key={g.valor}>
            <SecaoTitulo>
              {g.nome}
              {g.valor === hoje && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] tracking-normal normal-case">
                  hoje
                </span>
              )}
            </SecaoTitulo>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {g.materias.map((m) => (
                  <MateriaCard key={m.id} materia={m} dia={g.valor} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))
      )}
    </div>
  )
}
