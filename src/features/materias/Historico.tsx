import { CalendarPlus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { useAcoesFalta } from './useAcoesFalta'
import { LIMITES, type Falta, type Materia } from './model'

const fmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function hojeISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

/** Faltas com data primeiro (mais recentes no topo); as migradas sem data vão para o fim. */
function ordenar(faltas: Falta[]) {
  return [...faltas].sort((a, b) => (b.data?.toMillis() ?? -1) - (a.data?.toMillis() ?? -1))
}

export function Historico({ materia }: { materia: Materia }) {
  const { registrar, remover } = useAcoesFalta()
  const [data, setData] = useState(hojeISO)
  const [obs, setObs] = useState('')

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    // meio-dia evita a data "voltar um dia" por causa do fuso
    registrar(materia, { data: new Date(`${data}T12:00:00`), obs })
    setObs('')
  }

  const faltas = ordenar(materia.faltas)

  return (
    <div className="grid gap-5">
      <form onSubmit={adicionar} className="bg-muted/60 grid gap-3 rounded-2xl p-4">
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <Field id="data-falta" label="Data da falta">
            <Input
              id="data-falta"
              type="date"
              value={data}
              max={hojeISO()}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </Field>
          <Button
            type="submit"
            size="icon"
            aria-label="Registrar falta nesta data"
            className="h-12 w-12"
          >
            <CalendarPlus className="size-5" />
          </Button>
        </div>
        <Input
          placeholder="Observação (opcional): ex. consulta médica"
          maxLength={LIMITES.obs}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          aria-label="Observação"
        />
      </form>

      <div>
        <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          {faltas.length} {faltas.length === 1 ? 'falta registrada' : 'faltas registradas'}
        </h4>
        {faltas.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Nenhuma falta ainda. Continue assim! ✨
          </p>
        ) : (
          <ul className="divide-y rounded-2xl border">
            <AnimatePresence initial={false}>
              {faltas.map((f) => (
                <motion.li
                  key={f.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 overflow-hidden px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium first-letter:uppercase">
                      {f.data ? fmt.format(f.data.toDate()) : 'Antes da atualização'}
                    </p>
                    {f.obs && <p className="text-muted-foreground truncate text-xs">{f.obs}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover esta falta"
                    onClick={() => remover(materia, f)}
                  >
                    <Trash2 />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
