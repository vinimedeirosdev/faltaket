import { Check, ListChecks, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { cn, vibrate } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { useMaterias } from '../materias/MateriasProvider'
import { COR_CLASSES } from '../materias/model'
import { useAgendaModais } from './AgendaModaisProvider'
import { definirConcluido } from './api'
import { diasAte, quando, TIPO_INFO, type Evento } from './model'

const fmtDia = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

export function EventoItem({ evento, semMateria }: { evento: Evento; semMateria?: boolean }) {
  const { uid } = useUsuario()
  const { materias } = useMaterias()
  const modais = useAgendaModais()
  const materia = evento.materiaId ? materias.find((m) => m.id === evento.materiaId) : undefined
  const data = evento.data.toDate()
  const dias = diasAte(data, new Date())
  const info = TIPO_INFO[evento.tipo]
  const feitos = evento.checklist.filter((i) => i.feito).length

  function alternar() {
    const novo = !evento.concluido
    vibrate(novo ? [10, 40, 10] : 8)
    definirConcluido(uid, evento.id, novo).catch(avisarErro)
    if (novo) {
      toast.success(`"${evento.titulo}" concluído 🎉`, {
        action: {
          label: 'Desfazer',
          onClick: () => definirConcluido(uid, evento.id, false).catch(avisarErro),
        },
      })
    }
  }

  const urgente = !evento.concluido && dias >= 0 && dias <= 1
  const atrasado = !evento.concluido && dias < 0

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'bg-card flex items-start gap-3 rounded-2xl border p-3.5',
        evento.concluido && 'opacity-60',
      )}
    >
      <button
        type="button"
        onClick={alternar}
        aria-label={evento.concluido ? 'Marcar como não concluído' : 'Marcar como concluído'}
        className={cn(
          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors',
          evento.concluido
            ? 'bg-ok border-ok text-white'
            : 'border-muted-foreground/40 hover:border-primary',
        )}
      >
        {evento.concluido && <Check className="size-4" strokeWidth={3} />}
      </button>

      <button
        type="button"
        onClick={() => modais.editar(evento)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', info.classe)}>
            {info.emoji} {info.nome}
          </span>
          {materia && !semMateria && (
            <span className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
              <span className={cn('size-2 shrink-0 rounded-full', COR_CLASSES[materia.cor]?.dot)} />
              <span className="truncate">{materia.nome}</span>
            </span>
          )}
        </div>
        <p className={cn('mt-1 font-semibold', evento.concluido && 'line-through')}>
          {evento.titulo}
        </p>
        <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className="first-letter:uppercase">
            {fmtDia.format(data)}
            {evento.temHora && ` · ${fmtHora.format(data)}`}
          </span>
          {evento.local && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {evento.local}
            </span>
          )}
          {evento.checklist.length > 0 && (
            <span className="flex items-center gap-1">
              <ListChecks className="size-3" />
              {feitos}/{evento.checklist.length}
            </span>
          )}
        </p>
      </button>

      {!evento.concluido && (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap',
            atrasado
              ? 'bg-danger/12 text-danger'
              : urgente
                ? 'bg-warn/15 text-warn'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {quando(data, new Date())}
        </span>
      )}
    </motion.li>
  )
}
