import { CalendarPlus, FileCheck2, FileX2, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { useAcoesFalta } from './useAcoesFalta'
import { cn, hojeISO } from '@/lib/utils'
import { faltasContadas, LIMITES, type Falta, type Materia } from './model'

const fmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** Faltas com data primeiro (mais recentes no topo); as migradas sem data vão para o fim. */
function ordenar(faltas: Falta[]) {
  return [...faltas].sort((a, b) => (b.data?.toMillis() ?? -1) - (a.data?.toMillis() ?? -1))
}

export function Historico({ materia }: { materia: Materia }) {
  const { registrar, remover, alternarJustificada } = useAcoesFalta()
  const [data, setData] = useState(hojeISO)
  const [obs, setObs] = useState('')
  const [dupla, setDupla] = useState(false)
  const [justificada, setJustificada] = useState(false)

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    // meio-dia evita a data "voltar um dia" por causa do fuso
    registrar(materia, {
      data: new Date(`${data}T12:00:00`),
      obs,
      aulas: dupla ? 2 : 1,
      justificada,
    })
    setObs('')
    setDupla(false)
    setJustificada(false)
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
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary size-5"
              checked={dupla}
              onChange={(e) => setDupla(e.target.checked)}
            />
            Aula dupla (conta 2)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary size-5"
              checked={justificada}
              onChange={(e) => setJustificada(e.target.checked)}
            />
            Justificada (atestado)
          </label>
        </div>
      </form>

      <div>
        <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          {faltas.length} {faltas.length === 1 ? 'registro' : 'registros'} ·{' '}
          {faltasContadas(faltas)} {faltasContadas(faltas) === 1 ? 'conta' : 'contam'} no limite
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
                  className={cn(
                    'flex items-center gap-2 overflow-hidden px-4 py-3',
                    f.justificada && 'opacity-70',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium first-letter:uppercase">
                      {f.data ? fmt.format(f.data.toDate()) : 'Antes da atualização'}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {f.aulas === 2 && <Etiqueta>aula dupla</Etiqueta>}
                      {f.justificada && (
                        <Etiqueta className="bg-ok/12 text-ok">justificada</Etiqueta>
                      )}
                      {f.obs && (
                        <span className="text-muted-foreground truncate text-xs">{f.obs}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label={f.justificada ? 'Remover justificativa' : 'Justificar falta'}
                    title={f.justificada ? 'Remover justificativa' : 'Justificar (atestado)'}
                    onClick={() => alternarJustificada(materia, f)}
                  >
                    {f.justificada ? <FileX2 /> : <FileCheck2 />}
                  </Button>
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

function Etiqueta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('bg-muted rounded-full px-2 py-0.5 text-[11px] font-medium', className)}>
      {children}
    </span>
  )
}
