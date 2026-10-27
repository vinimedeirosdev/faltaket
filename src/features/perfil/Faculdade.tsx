import { CalendarArrowDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { baixarIcs, gerarIcs } from '@/lib/ics'
import { useEventos } from '../agenda/EventosProvider'
import { atualizarConfig } from '../auth/api'
import { useUsuario } from '../auth/AuthProvider'
import { useMaterias } from '../materias/MateriasProvider'
import { formatarNota } from '../notas/calculo'

const lerNota = (t: string) => {
  const s = t.trim().replace(',', '.')
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 && n <= 10 ? n : NaN
}
const mostrar = (n?: number) => (n == null ? '' : formatarNota(n).replace(',0', ''))

/** Perfil → "Faculdade": médias, datas do semestre e exportar a agenda. */
export function Faculdade() {
  const { config } = useUsuario()
  const { materias } = useMaterias()
  const { eventos } = useEventos()
  const [media, setMedia] = useState(mostrar(config.mediaAprovacao))
  const [exame, setExame] = useState(mostrar(config.mediaExame))
  const [inicio, setInicio] = useState(config.semestreInicio ?? '')
  const [fim, setFim] = useState(config.semestreFim ?? '')

  const vMedia = lerNota(media)
  const vExame = lerNota(exame)
  const erroMedia = vMedia === null || Number.isNaN(vMedia) ? 'Use um valor entre 0 e 10' : null
  const erroExame =
    vExame !== null && (Number.isNaN(vExame) || (vMedia !== null && vExame >= vMedia))
      ? 'Precisa ser menor que a média de aprovação'
      : null
  const erroDatas = inicio && fim && fim <= inicio ? 'O fim precisa ser depois do início' : null
  const mudou =
    vMedia !== config.mediaAprovacao ||
    vExame !== (config.mediaExame ?? null) ||
    inicio !== (config.semestreInicio ?? '') ||
    fim !== (config.semestreFim ?? '')

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (erroMedia || erroExame || erroDatas) return
    atualizarConfig({
      mediaAprovacao: vMedia!,
      mediaExame: vExame,
      semestreInicio: inicio || null,
      semestreFim: fim || null,
    }).catch((err) => {
      console.error(err)
      toast.error('Não foi possível salvar. Tente de novo.')
    })
    toast.success('Preferências salvas!')
  }

  function exportar() {
    const ics = gerarIcs({
      materias,
      eventos,
      semestreInicio: config.semestreInicio,
      semestreFim: config.semestreFim,
    })
    baixarIcs(ics)
    toast.success('Arquivo da agenda baixado', {
      description: 'Abra o arquivo para importar no Google Agenda ou no Calendário do iPhone.',
    })
  }

  return (
    <div className="grid gap-4 p-4">
      <form onSubmit={salvar} className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="media" label="Média para aprovar" erro={erroMedia ?? undefined}>
            <Input
              id="media"
              inputMode="decimal"
              value={media}
              aria-invalid={!!erroMedia}
              onChange={(e) => setMedia(e.target.value)}
            />
          </Field>
          <Field
            id="exame"
            label="Exame a partir de"
            erro={erroExame ?? undefined}
            dica="Vazio = sem exame"
          >
            <Input
              id="exame"
              inputMode="decimal"
              placeholder="Ex.: 4"
              value={exame}
              aria-invalid={!!erroExame}
              onChange={(e) => setExame(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field id="sem-inicio" label="Início do semestre">
            <Input
              id="sem-inicio"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </Field>
          <Field id="sem-fim" label="Fim do semestre" erro={erroDatas ?? undefined}>
            <Input id="sem-fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </Field>
        </div>
        {mudou && (
          <Button type="submit" disabled={!!(erroMedia || erroExame || erroDatas)}>
            Salvar
          </Button>
        )}
      </form>

      <div className="grid gap-1.5 border-t pt-4">
        <Button variant="outline" onClick={exportar}>
          <CalendarArrowDown /> Exportar para o Google Agenda / iPhone
        </Button>
        <p className="text-muted-foreground text-xs">
          Gera um arquivo com as aulas (toda semana, até o fim do semestre) e as provas e entregas.
          Matérias sem horário de início não entram.
        </p>
      </div>
    </div>
  )
}
