import { BookOpen, Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { EmptyState, Skeleton } from '@/components/ui/misc'
import { SecaoTitulo } from './HojePage'
import { MateriaCard } from './MateriaCard'
import { useMateriaModais } from './MateriaModaisProvider'
import { useMaterias } from './MateriasProvider'
import { DIAS, diaSemanaDe } from './model'

export function MateriasPage() {
  const { materias, carregando } = useMaterias()
  const modais = useMateriaModais()
  const hoje = diaSemanaDe(new Date())

  const grupos = DIAS.map((d) => ({
    ...d,
    materias: materias.filter((m) => m.diaSemana === d.valor),
  })).filter((g) => g.materias.length > 0)

  return (
    <div className="grid gap-8 pt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matérias</h1>
          <p className="text-muted-foreground text-sm">Organizadas por dia da semana</p>
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
                  <MateriaCard key={m.id} materia={m} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))
      )}
    </div>
  )
}
