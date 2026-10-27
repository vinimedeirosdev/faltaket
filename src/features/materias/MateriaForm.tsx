import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Check, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { COR_CLASSES, CORES, DIAS, LIMITES, type DiaSemana, type MateriaInput } from './model'

const hora = z.union([
  z.literal(''),
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida'),
])

const horarioSchema = z
  .object({
    dia: z.literal([1, 2, 3, 4, 5, 6, 7]),
    inicio: hora,
    fim: hora,
    sala: z.string().trim().max(LIMITES.sala, `Máximo de ${LIMITES.sala} caracteres`),
    dupla: z.boolean(),
  })
  .refine((h) => !h.inicio || !h.fim || h.fim > h.inicio, {
    message: 'O fim precisa ser depois do início',
    path: ['fim'],
  })

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Dê um nome para a matéria')
    .max(LIMITES.nome, `Máximo de ${LIMITES.nome} caracteres`),
  horarios: z
    .array(horarioSchema)
    .min(1, 'Adicione pelo menos um dia de aula')
    .max(LIMITES.horarios, `Máximo de ${LIMITES.horarios} horários`),
  maxFaltas: z
    .number({ error: 'Informe um número' })
    .int()
    .min(1, 'Mínimo 1')
    .max(LIMITES.maxFaltas, `Máximo ${LIMITES.maxFaltas}`),
  cor: z.enum(CORES),
  professorNome: z.string().trim().max(LIMITES.professor),
  professorEmail: z.union([
    z.literal(''),
    z.email('E-mail inválido').max(LIMITES.email, 'E-mail muito longo'),
  ]),
})

type Valores = z.infer<typeof schema>

function paraValores(m: MateriaInput): Valores {
  return {
    nome: m.nome,
    horarios: m.horarios.map((h) => ({
      dia: h.dia,
      inicio: h.inicio ?? '',
      fim: h.fim ?? '',
      sala: h.sala ?? '',
      dupla: h.aulas === 2,
    })),
    maxFaltas: m.maxFaltas,
    cor: m.cor,
    professorNome: m.professor?.nome ?? '',
    professorEmail: m.professor?.email ?? '',
  }
}

function paraMateria(v: Valores): MateriaInput {
  return {
    nome: v.nome,
    horarios: v.horarios.map((h) => ({
      dia: h.dia as DiaSemana,
      aulas: h.dupla ? 2 : 1,
      inicio: h.inicio || undefined,
      fim: h.fim || undefined,
      sala: h.sala || undefined,
    })),
    maxFaltas: v.maxFaltas,
    cor: v.cor,
    professor: v.professorNome
      ? { nome: v.professorNome, email: v.professorEmail || undefined }
      : null,
  }
}

export function MateriaForm({
  inicial,
  onSubmit,
  textoBotao,
}: {
  inicial: MateriaInput
  onSubmit: (dados: MateriaInput) => void
  textoBotao: string
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: paraValores(inicial) })
  const horarios = useFieldArray({ control, name: 'horarios' })

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(paraMateria(v)))}
      className="grid gap-6"
      noValidate
    >
      <Field id="nome" label="Nome da matéria" erro={errors.nome?.message}>
        <Input
          id="nome"
          placeholder="Ex.: Anatomia"
          maxLength={LIMITES.nome}
          autoComplete="off"
          aria-invalid={!!errors.nome}
          {...register('nome')}
        />
      </Field>

      {/* ── horários ── */}
      <div className="grid gap-3">
        <Label>Dias e horários</Label>
        {horarios.fields.map((campo, i) => {
          const erro = errors.horarios?.[i]
          return (
            <div key={campo.id} className="bg-muted/60 grid gap-3 rounded-2xl p-3">
              <Controller
                control={control}
                name={`horarios.${i}.dia`}
                render={({ field }) => (
                  <div
                    className="grid grid-cols-7 gap-1"
                    role="radiogroup"
                    aria-label="Dia da aula"
                  >
                    {DIAS.map((d) => (
                      <button
                        key={d.valor}
                        type="button"
                        role="radio"
                        aria-checked={field.value === d.valor}
                        aria-label={d.nome}
                        onClick={() => field.onChange(d.valor)}
                        className={cn(
                          'h-10 rounded-lg border text-xs font-semibold transition-colors',
                          field.value === d.valor
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card hover:bg-muted',
                        )}
                      >
                        {d.curto}
                      </button>
                    ))}
                  </div>
                )}
              />
              <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-2">
                <Input
                  type="time"
                  aria-label="Hora de início"
                  className="h-11 px-2 text-sm"
                  aria-invalid={!!erro?.inicio}
                  {...register(`horarios.${i}.inicio`)}
                />
                <Input
                  type="time"
                  aria-label="Hora de término"
                  className="h-11 px-2 text-sm"
                  aria-invalid={!!erro?.fim}
                  {...register(`horarios.${i}.fim`)}
                />
                <Input
                  placeholder="Sala"
                  aria-label="Sala"
                  maxLength={LIMITES.sala}
                  className="h-11 px-3 text-sm"
                  {...register(`horarios.${i}.sala`)}
                />
              </div>
              {(erro?.inicio || erro?.fim) && (
                <p role="alert" className="text-destructive text-sm">
                  {erro.inicio?.message ?? erro.fim?.message}
                </p>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-primary size-5"
                    {...register(`horarios.${i}.dupla`)}
                  />
                  Aula dupla <span className="text-muted-foreground">(falta conta 2)</span>
                </label>
                {horarios.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remover horário"
                    onClick={() => horarios.remove(i)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        {errors.horarios?.root?.message && (
          <p role="alert" className="text-destructive text-sm">
            {errors.horarios.root.message}
          </p>
        )}
        {horarios.fields.length < LIMITES.horarios && (
          <Button
            type="button"
            variant="outline"
            onClick={() => horarios.append({ dia: 1, inicio: '', fim: '', sala: '', dupla: false })}
          >
            <Plus /> Adicionar outro dia
          </Button>
        )}
      </div>

      {/* ── limite de faltas ── */}
      <Controller
        control={control}
        name="maxFaltas"
        render={({ field }) => (
          <Field
            id="maxFaltas"
            label="Quantas faltas você pode ter?"
            erro={errors.maxFaltas?.message}
          >
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Diminuir"
                onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
              >
                <Minus className="size-5" />
              </Button>
              <Input
                id="maxFaltas"
                type="number"
                inputMode="numeric"
                min={1}
                max={LIMITES.maxFaltas}
                className="text-center text-lg font-semibold tabular-nums"
                aria-invalid={!!errors.maxFaltas}
                value={Number.isNaN(field.value) ? '' : field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Aumentar"
                onClick={() => field.onChange(Math.min(LIMITES.maxFaltas, (field.value || 0) + 1))}
              >
                <Plus className="size-5" />
              </Button>
            </div>
            <CalculoLimite onCalcular={(n) => setValue('maxFaltas', n, { shouldValidate: true })} />
          </Field>
        )}
      />

      {/* ── professor ── */}
      <div className="grid gap-2">
        <Label>
          Professor(a) <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Nome"
            aria-label="Nome do professor"
            maxLength={LIMITES.professor}
            autoComplete="off"
            {...register('professorNome')}
          />
          <Input
            type="email"
            inputMode="email"
            placeholder="E-mail"
            aria-label="E-mail do professor"
            autoComplete="off"
            aria-invalid={!!errors.professorEmail}
            {...register('professorEmail')}
          />
        </div>
        {errors.professorEmail && (
          <p role="alert" className="text-destructive text-sm">
            {errors.professorEmail.message}
          </p>
        )}
      </div>

      {/* ── cor ── */}
      <Controller
        control={control}
        name="cor"
        render={({ field }) => (
          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="Cor">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={field.value === c}
                  aria-label={c}
                  onClick={() => field.onChange(c)}
                  className={cn(
                    'ring-offset-popover grid aspect-square w-full max-w-11 place-items-center rounded-full text-white transition-transform active:scale-90',
                    COR_CLASSES[c].dot,
                    field.value === c && 'ring-foreground/70 ring-2 ring-offset-2',
                  )}
                >
                  {field.value === c && <Check className="size-5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      <Button type="submit" size="lg" className="mt-1">
        {textoBotao}
      </Button>
    </form>
  )
}

/** "Não sabe o limite?" → total de aulas × 25% (frequência mínima de 75%). */
function CalculoLimite({ onCalcular }: { onCalcular: (n: number) => void }) {
  const [aberto, setAberto] = useState(false)
  const [total, setTotal] = useState('')
  const n = Math.floor(Number(total) * 0.25)

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-primary flex items-center gap-1.5 justify-self-start text-xs font-semibold"
      >
        <Calculator className="size-3.5" /> Não sabe? Calcular pelo total de aulas
      </button>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Total de aulas no semestre"
        aria-label="Total de aulas no semestre"
        className="h-10 text-sm"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={!(n >= 1)}
        onClick={() => {
          onCalcular(Math.min(n, LIMITES.maxFaltas))
          setAberto(false)
        }}
      >
        Usar {n >= 1 ? n : '–'}
      </Button>
    </div>
  )
}
