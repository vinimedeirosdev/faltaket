import type { Nota } from '../materias/model'

export type Situacao = 'sem-notas' | 'andamento' | 'aprovada' | 'exame' | 'reprovada'

export interface ResultadoNotas {
  /** média ponderada só das notas já lançadas (null se nenhuma saiu) */
  media: number | null
  situacao: Situacao
  /** média que precisa tirar nas avaliações que faltam (arredondada para cima, 1 casa) */
  precisa: number | null
  mensagem: string
}

const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const formatarNota = (n: number) => fmt.format(n)

/** Arredonda para cima na 1ª casa: 6,51 → 6,6 (melhor sobrar que faltar). */
const arredondarParaCima = (n: number) => Math.ceil(n * 10 - 1e-9) / 10

/**
 * Média ponderada + "quanto preciso tirar".
 * - meta: média para aprovar direto (ex.: 7)
 * - mediaExame: abaixo da meta mas >= este valor vai para exame/recuperação (opcional)
 */
export function calcularNotas(
  notas: Nota[],
  meta: number,
  mediaExame?: number | null,
): ResultadoNotas {
  const validas = notas.filter((n) => n.peso > 0)
  if (validas.length === 0) {
    return {
      media: null,
      situacao: 'sem-notas',
      precisa: null,
      mensagem: 'Nenhuma nota cadastrada',
    }
  }

  const lancadas = validas.filter((n) => n.valor !== null)
  const pendentes = validas.filter((n) => n.valor === null)
  const pesoTotal = validas.reduce((s, n) => s + n.peso, 0)
  const pesoLancado = lancadas.reduce((s, n) => s + n.peso, 0)
  const pontos = lancadas.reduce((s, n) => s + n.valor! * n.peso, 0)
  const media = pesoLancado > 0 ? pontos / pesoLancado : null

  // todas as notas saíram: situação final
  if (pendentes.length === 0) {
    const final = media!
    if (final >= meta - 1e-9) {
      return { media: final, situacao: 'aprovada', precisa: null, mensagem: 'Aprovada! 🎉' }
    }
    if (mediaExame != null && final >= mediaExame - 1e-9) {
      return {
        media: final,
        situacao: 'exame',
        precisa: null,
        mensagem: `Ficou de exame (faltou ${formatarNota(arredondarParaCima(meta - final))})`,
      }
    }
    return { media: final, situacao: 'reprovada', precisa: null, mensagem: 'Abaixo da média' }
  }

  const pesoPendente = pesoTotal - pesoLancado
  const precisa = (meta * pesoTotal - pontos) / pesoPendente

  if (precisa <= 0) {
    return {
      media,
      situacao: 'aprovada',
      precisa: 0,
      mensagem: 'Já está aprovada, mesmo tirando 0!',
    }
  }
  if (precisa > 10 + 1e-9) {
    return {
      media,
      situacao: 'andamento',
      precisa: arredondarParaCima(precisa),
      mensagem: `Mesmo com 10 não chega a ${formatarNota(meta)}${mediaExame != null ? ': foco no exame' : ''}`,
    }
  }
  const valor = arredondarParaCima(precisa)
  const alvo =
    pendentes.length === 1
      ? `na ${pendentes[0].nome}`
      : `de média nas ${pendentes.length} que faltam`
  return {
    media,
    situacao: 'andamento',
    precisa: valor,
    mensagem: `Precisa tirar ${formatarNota(valor)} ${alvo}`,
  }
}
