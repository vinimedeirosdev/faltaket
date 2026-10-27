import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Label, Textarea } from '@/components/ui/input'
import { cn, hojeISO, uid } from '@/lib/utils'
import { useMaterias } from '../materias/MateriasProvider'
import { LIMITES_EVENTO, TIPO_INFO, TIPOS, type EventoInput } from './model'

const schema = z.object({
  tipo: z.enum(TIPOS),
  titulo: z
    .string()
    .trim()
    .min(1, 'Dê um título')
    .max(LIMITES_EVENTO.titulo, `Máximo de ${LIMITES_EVENTO.titulo} caracteres`),
  materiaId: z.string(),
  dia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha a data'),
  hora: z.union([z.literal(''), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]),
  local: z.string().trim().max(LIMITES_EVENTO.local),
  descricao: z.string().trim().max(LIMITES_EVENTO.descricao),
  checklist: z
    .array(
      z.object({ id: z.string(), texto: z.string().max(LIMITES_EVENTO.item), feito: z.boolean() }),
    )
    .max(LIMITES_EVENTO.checklist),
  criarNota: z.boolean(),
})
type Valores = z.infer<typeof schema>

const doisDigitos = (n: number) => String(n).padStart(2, '0')

function paraValores(e: Partial<EventoInput>): Valores {
  const d = e.data
  return {
    tipo: e.tipo ?? 'prova',
    titulo: e.titulo ?? '',
    materiaId: e.materiaId ?? '',
    dia: d
      ? `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
      : hojeISO(),
    hora: d && e.temHora ? `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}` : '',
    local: e.local ?? '',
    descricao: e.descricao ?? '',
    checklist: e.checklist ?? [],
    criarNota: false,
  }
}

export function EventoForm({
  inicial,
  novo,
  onSubmit,
  onExcluir,
}: {
  inicial: Partial<EventoInput>
  novo: boolean
  onSubmit: (dados: EventoInput, opts: { criarNota: boolean }) => void
  onExcluir?: () => void
}) {
  const { materias } = useMaterias()
  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: paraValores(inicial) })
  const checklist = useFieldArray({ control, name: 'checklist' })
  const tipo = useWatch({ control, name: 'tipo' })
  const materiaId = useWatch({ control, name: 'materiaId' })

  function enviar(v: Valores) {
    const [ano, mes, dia] = v.dia.split('-').map(Number)
    const [h, m] = v.hora ? v.hora.split(':').map(Number) : [12, 0]
    onSubmit(
      {
        tipo: v.tipo,
        titulo: v.titulo,
        materiaId: v.materiaId || null,
        data: new Date(ano, mes - 1, dia, h, m),
        temHora: !!v.hora,
        local: v.local,
        descricao: v.descricao,
        checklist: v.checklist,
      },
      { criarNota: v.criarNota },
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-5" noValidate>
      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Tipo">
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={field.value === t}
                onClick={() => field.onChange(t)}
                className={cn(
                  'flex h-14 flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-colors',
                  field.value === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-muted',
                )}
              >
                <span className="text-base leading-none">{TIPO_INFO[t].emoji}</span>
                {TIPO_INFO[t].nome}
              </button>
            ))}
          </div>
        )}
      />

      <Field id="titulo" label="Título" erro={errors.titulo?.message}>
        <Input
          id="titulo"
          placeholder={tipo === 'prova' ? 'Ex.: P1 de Anatomia' : 'Ex.: Relatório de laboratório'}
          maxLength={LIMITES_EVENTO.titulo}
          autoComplete="off"
          aria-invalid={!!errors.titulo}
          {...register('titulo')}
        />
      </Field>

      <Field id="materia" label="Matéria">
        <select
          id="materia"
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border px-4 text-base outline-none focus-visible:ring-[3px]"
          {...register('materiaId')}
        >
          <option value="">Nenhuma</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-[1.4fr_1fr] gap-2">
        <Field id="dia" label="Data" erro={errors.dia?.message}>
          <Input id="dia" type="date" {...register('dia')} />
        </Field>
        <Field id="hora" label="Hora (opcional)">
          <Input id="hora" type="time" {...register('hora')} />
        </Field>
      </div>

      <Field id="local" label="Local (opcional)">
        <Input
          id="local"
          placeholder="Ex.: Bloco B, sala 12 / Moodle"
          maxLength={LIMITES_EVENTO.local}
          {...register('local')}
        />
      </Field>

      <Field id="descricao" label="Anotações (opcional)">
        <Textarea
          id="descricao"
          placeholder="Conteúdo da prova, regras do trabalho..."
          maxLength={LIMITES_EVENTO.descricao}
          {...register('descricao')}
        />
      </Field>

      {/* checklist */}
      <div className="grid gap-2">
        <Label>Checklist</Label>
        {checklist.fields.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary size-5 shrink-0"
              aria-label="Feito"
              {...register(`checklist.${i}.feito`)}
            />
            <Input
              className="h-10 text-sm"
              placeholder="Ex.: revisar capítulo 3"
              maxLength={LIMITES_EVENTO.item}
              {...register(`checklist.${i}.texto`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remover item"
              onClick={() => checklist.remove(i)}
            >
              <X />
            </Button>
          </div>
        ))}
        {checklist.fields.length < LIMITES_EVENTO.checklist && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => checklist.append({ id: uid(), texto: '', feito: false })}
          >
            <Plus /> Adicionar item
          </Button>
        )}
      </div>

      {novo && tipo === 'prova' && materiaId && (
        <label className="bg-secondary/60 flex items-center gap-3 rounded-xl p-3 text-sm">
          <input type="checkbox" className="accent-primary size-5" {...register('criarNota')} />
          Criar esta avaliação nas Notas da matéria
        </label>
      )}

      <div className="grid gap-2">
        <Button type="submit" size="lg">
          {novo ? 'Adicionar' : 'Salvar alterações'}
        </Button>
        {onExcluir && (
          <Button type="button" variant="ghost" className="text-destructive" onClick={onExcluir}>
            <Trash2 /> Excluir
          </Button>
        )}
      </div>
    </form>
  )
}
