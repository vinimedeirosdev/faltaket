import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { cn, uid } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { definirMediaDaMateria, salvarNotas } from '../materias/api'
import { LIMITES, type Materia, type Nota } from '../materias/model'
import { calcularNotas, formatarNota, type Situacao } from './calculo'

const SITUACAO: Record<Situacao, string> = {
  'sem-notas': 'text-muted-foreground',
  andamento: 'text-foreground',
  aprovada: 'text-ok',
  exame: 'text-warn',
  reprovada: 'text-danger',
}

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

/** Converte o texto digitado ("7,5", "") em número ou null. */
function lerNumero(texto: string): number | null {
  const t = texto.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

type Linha = { id: string; nome: string; peso: string; valor: string }

const paraLinhas = (notas: Nota[]): Linha[] =>
  notas.map((n) => ({
    id: n.id,
    nome: n.nome,
    peso: String(n.peso).replace('.', ','),
    valor: n.valor === null ? '' : String(n.valor).replace('.', ','),
  }))

/** Aba "Notas" da matéria: lista editável + média + "quanto preciso tirar". */
export function NotasMateria({ materia }: { materia: Materia }) {
  const { uid: userId, config } = useUsuario()
  const [linhas, setLinhas] = useState<Linha[]>(() => paraLinhas(materia.notas ?? []))
  const [sujo, setSujo] = useState(false)

  const meta = materia.mediaAprovacao ?? config.mediaAprovacao

  // valida e converte o que está na tela (mesmo antes de salvar, para a prévia)
  const convertidas = linhas.map((l) => ({
    id: l.id,
    nome: l.nome.trim(),
    peso: lerNumero(l.peso),
    valor: lerNumero(l.valor),
  }))
  const erros = convertidas.map((n) => {
    if (!n.nome) return 'Dê um nome (ex.: P1)'
    if (n.peso === null || Number.isNaN(n.peso) || n.peso <= 0 || n.peso > 10)
      return 'Peso entre 0,1 e 10'
    if (n.valor !== null && (Number.isNaN(n.valor) || n.valor < 0 || n.valor > 10))
      return 'Nota entre 0 e 10'
    return null
  })
  const validas = erros.every((e) => e === null)
  const notas: Nota[] = validas
    ? convertidas.map((n) => ({ ...n, peso: n.peso!, valor: n.valor }))
    : []
  const r = calcularNotas(validas ? notas : (materia.notas ?? []), meta, config.mediaExame)

  function mudar(id: string, campo: keyof Linha, valor: string) {
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)))
    setSujo(true)
  }

  function adicionar() {
    const numero = linhas.filter((l) => /^P\d+$/i.test(l.nome)).length + 1
    setLinhas((ls) => [...ls, { id: uid(), nome: `P${numero}`, peso: '1', valor: '' }])
    setSujo(true)
  }

  function remover(id: string) {
    setLinhas((ls) => ls.filter((l) => l.id !== id))
    setSujo(true)
  }

  function salvar() {
    if (!validas) return
    salvarNotas(userId, materia.id, notas).catch(avisarErro)
    setSujo(false)
    toast.success('Notas salvas!')
  }

  return (
    <div className="grid gap-5">
      {/* resumo */}
      <div className="bg-card grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border p-5">
        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums">
            {r.media === null ? '–' : formatarNota(r.media)}
          </p>
          <p className="text-muted-foreground text-xs">média atual</p>
        </div>
        <div>
          <p className={cn('font-semibold', SITUACAO[r.situacao])}>{r.mensagem}</p>
          <p className="text-muted-foreground text-xs">
            Média para aprovar: {formatarNota(meta)}
            {config.mediaExame != null && ` · exame a partir de ${formatarNota(config.mediaExame)}`}
          </p>
        </div>
      </div>

      {/* lista */}
      <div className="grid gap-2">
        {linhas.length > 0 && (
          <div className="text-muted-foreground grid grid-cols-[1fr_4.5rem_4.5rem_2.25rem] gap-2 px-1 text-xs font-medium">
            <span>Avaliação</span>
            <span>Peso</span>
            <span>Nota</span>
          </div>
        )}
        {linhas.map((l, i) => (
          <div key={l.id} className="grid gap-1">
            <div className="grid grid-cols-[1fr_4.5rem_4.5rem_2.25rem] items-center gap-2">
              <Input
                aria-label="Nome da avaliação"
                value={l.nome}
                maxLength={LIMITES.notaNome}
                className="h-11 px-3"
                onChange={(e) => mudar(l.id, 'nome', e.target.value)}
              />
              <Input
                aria-label="Peso"
                inputMode="decimal"
                value={l.peso}
                className="h-11 px-2 text-center tabular-nums"
                onChange={(e) => mudar(l.id, 'peso', e.target.value)}
              />
              <Input
                aria-label="Nota"
                inputMode="decimal"
                placeholder="–"
                value={l.valor}
                className="h-11 px-2 text-center font-semibold tabular-nums"
                onChange={(e) => mudar(l.id, 'valor', e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover avaliação"
                onClick={() => remover(l.id)}
              >
                <Trash2 />
              </Button>
            </div>
            {erros[i] && (
              <p role="alert" className="text-destructive px-1 text-xs">
                {erros[i]}
              </p>
            )}
          </div>
        ))}
        {linhas.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            Cadastre as provas e trabalhos com o peso de cada um. Deixe a nota vazia até sair. 📝
          </p>
        )}
        {linhas.length < LIMITES.notas && (
          <Button variant="outline" onClick={adicionar}>
            <Plus /> Adicionar avaliação
          </Button>
        )}
        {sujo && (
          <Button size="lg" onClick={salvar} disabled={!validas}>
            Salvar notas
          </Button>
        )}
      </div>

      <MediaDaMateria materia={materia} padrao={config.mediaAprovacao} />
    </div>
  )
}

/** Algumas matérias têm média diferente (ex.: 6): sobrescreve só nesta. */
function MediaDaMateria({ materia, padrao }: { materia: Materia; padrao: number }) {
  const { uid: userId } = useUsuario()
  const [texto, setTexto] = useState(
    materia.mediaAprovacao != null ? String(materia.mediaAprovacao).replace('.', ',') : '',
  )
  const valor = lerNumero(texto)
  const invalido = valor !== null && (Number.isNaN(valor) || valor < 0 || valor > 10)

  function salvar() {
    if (invalido || valor === (materia.mediaAprovacao ?? null)) return
    definirMediaDaMateria(userId, materia.id, valor).catch(avisarErro)
    toast.success(valor === null ? 'Usando a média do perfil' : 'Média desta matéria salva')
  }

  return (
    <div className="grid gap-2 border-t pt-4">
      <Label htmlFor="media-materia">Média para aprovar nesta matéria</Label>
      <Input
        id="media-materia"
        inputMode="decimal"
        placeholder={`Igual à do perfil (${formatarNota(padrao)})`}
        value={texto}
        aria-invalid={invalido}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={salvar}
      />
      {invalido && <p className="text-destructive text-xs">Use um valor entre 0 e 10</p>}
    </div>
  )
}
