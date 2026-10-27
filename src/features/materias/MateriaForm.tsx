import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Minus, Plus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { COR_CLASSES, CORES, DIAS, LIMITES, type MateriaInput } from './model'

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Dê um nome para a matéria')
    .max(LIMITES.nome, `Máximo de ${LIMITES.nome} caracteres`),
  diaSemana: z.literal([1, 2, 3, 4, 5, 6, 7]),
  maxFaltas: z
    .number({ error: 'Informe um número' })
    .int()
    .min(1, 'Mínimo 1')
    .max(LIMITES.maxFaltas, `Máximo ${LIMITES.maxFaltas}`),
  cor: z.enum(CORES),
})

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
    formState: { errors },
  } = useForm<MateriaInput>({ resolver: zodResolver(schema), defaultValues: inicial })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
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

      <Controller
        control={control}
        name="diaSemana"
        render={({ field }) => (
          <div className="grid gap-2">
            <Label>Dia da aula</Label>
            <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Dia da aula">
              {DIAS.map((d) => (
                <button
                  key={d.valor}
                  type="button"
                  role="radio"
                  aria-checked={field.value === d.valor}
                  aria-label={d.nome}
                  onClick={() => field.onChange(d.valor)}
                  className={cn(
                    'h-11 rounded-xl border text-xs font-semibold transition-colors',
                    field.value === d.valor
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted',
                  )}
                >
                  {d.curto}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={control}
        name="maxFaltas"
        render={({ field }) => (
          <Field
            id="maxFaltas"
            label="Quantas faltas você pode ter?"
            erro={errors.maxFaltas?.message}
            dica="Confira no plano de ensino: normalmente 25% das aulas."
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
          </Field>
        )}
      />

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
