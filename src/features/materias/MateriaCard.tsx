import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { cn } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { calcularNotas, formatarNota } from '../notas/calculo'
import { BotoesFalta } from './BotoesFalta'
import { useMateriaModais } from './MateriaModaisProvider'
import {
  COR_CLASSES,
  DIAS,
  descreverHorario,
  diasDe,
  horariosNoDia,
  STATUS_CLASSES,
  statusDa,
  type DiaSemana,
  type Materia,
} from './model'
import { ProgressRing } from './ProgressRing'

/**
 * @param dia quando o card aparece dentro de um dia (Hoje, grupo de Matérias),
 *            mostra o horário e a sala daquele dia em vez da lista de dias.
 */
export function MateriaCard({
  materia,
  dia,
  destaque,
}: {
  materia: Materia
  dia?: DiaSemana
  destaque?: boolean
}) {
  const status = statusDa(materia)
  const cor = COR_CLASSES[materia.cor] ?? COR_CLASSES.violet
  const st = STATUS_CLASSES[status.tipo]
  const modais = useMateriaModais()
  const { config } = useUsuario()

  const doDia = dia ? horariosNoDia(materia, dia) : []
  const subtitulo = dia
    ? doDia.map(descreverHorario).filter(Boolean).join(' / ') ||
      DIAS.find((d) => d.valor === dia)!.nome
    : diasDe(materia)
        .map((d) => DIAS.find((x) => x.valor === d)!.curto)
        .join(' · ')

  const notas = calcularNotas(
    materia.notas ?? [],
    materia.mediaAprovacao ?? config.mediaAprovacao,
    config.mediaExame,
  )

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
        <Link to={`/materias/${materia.id}`} className="group min-w-0 flex-1">
          <p className={cn('truncate text-xs font-semibold tracking-wide uppercase', cor.text)}>
            {subtitulo}
          </p>
          <h3 className="mt-0.5 line-clamp-2 flex items-center gap-1 text-lg leading-snug font-semibold">
            {materia.nome}
            <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </h3>
        </Link>

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
            <MenuSeparator />
            <MenuItem destrutivo onSelect={() => modais.excluir(materia)}>
              <Trash2 /> Excluir
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pl-1.5">
        <div className="flex min-w-0 flex-col items-start gap-1.5">
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
          {notas.media !== null && (
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
              Média {formatarNota(notas.media)}
            </span>
          )}
        </div>
        <ProgressRing status={status} max={materia.maxFaltas} />
      </div>

      <BotoesFalta materia={materia} className="mt-3 pl-1.5" />
    </motion.article>
  )
}
