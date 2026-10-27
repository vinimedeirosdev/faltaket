import { History, Minus, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { cn } from '@/lib/utils'
import { useMateriaModais } from './MateriaModaisProvider'
import { calcularStatus, COR_CLASSES, nomeDoDia, STATUS_CLASSES, type Materia } from './model'
import { ProgressRing } from './ProgressRing'
import { useAcoesFalta } from './useAcoesFalta'

export function MateriaCard({ materia, destaque }: { materia: Materia; destaque?: boolean }) {
  const status = calcularStatus(materia.faltas.length, materia.maxFaltas)
  const cor = COR_CLASSES[materia.cor] ?? COR_CLASSES.violet
  const st = STATUS_CLASSES[status.tipo]
  const { registrar, removerUltima } = useAcoesFalta()
  const modais = useMateriaModais()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        'bg-card relative overflow-hidden rounded-3xl border p-4 shadow-sm transition-shadow',
        destaque && 'shadow-primary/10 ring-primary/15 shadow-md ring-1',
      )}
    >
      {/* faixa de cor da matéria */}
      <span className={cn('absolute inset-y-0 left-0 w-1.5', cor.dot)} aria-hidden />

      <div className="flex items-start gap-3 pl-1.5">
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-semibold tracking-wide uppercase', cor.text)}>
            {nomeDoDia(materia.diaSemana)}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-lg leading-snug font-semibold">{materia.nome}</h3>
        </div>

        <Menu>
          <MenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mt-1 -mr-2"
              aria-label={`Opções de ${materia.nome}`}
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => modais.editar(materia)}>
              <Pencil /> Editar
            </MenuItem>
            <MenuItem onSelect={() => modais.historico(materia)}>
              <History /> Histórico de faltas
            </MenuItem>
            <MenuSeparator />
            <MenuItem destrutivo onSelect={() => modais.excluir(materia)}>
              <Trash2 /> Excluir
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pl-1.5">
        <span
          className={cn(
            'inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            st.bg,
            st.text,
          )}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-current" />
          {status.mensagem}
        </span>
        <ProgressRing status={status} max={materia.maxFaltas} />
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 pl-1.5">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => removerUltima(materia)}
          disabled={materia.faltas.length === 0}
          aria-label="Remover última falta"
        >
          <Minus className="size-5" />
        </Button>
        <Button onClick={() => registrar(materia)}>
          <Plus className="size-5" /> Faltei hoje
        </Button>
      </div>
    </motion.article>
  )
}
