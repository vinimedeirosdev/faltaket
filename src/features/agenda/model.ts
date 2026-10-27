import type { Timestamp } from 'firebase/firestore'

// users/{uid}/eventos/{id}: provas, trabalhos e entregas (ver docs/DATA_MODEL.md)

export const TIPOS = ['prova', 'trabalho', 'entrega', 'outro'] as const
export type TipoEvento = (typeof TIPOS)[number]

export const TIPO_INFO: Record<TipoEvento, { nome: string; emoji: string; classe: string }> = {
  prova: { nome: 'Prova', emoji: '📝', classe: 'bg-rose-500/12 text-rose-600 dark:text-rose-300' },
  trabalho: {
    nome: 'Trabalho',
    emoji: '📚',
    classe: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  },
  entrega: {
    nome: 'Entrega',
    emoji: '📤',
    classe: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
  },
  outro: { nome: 'Outro', emoji: '📌', classe: 'bg-muted text-muted-foreground' },
}

export interface ItemChecklist {
  id: string
  texto: string
  feito: boolean
}

export interface Evento {
  id: string
  tipo: TipoEvento
  titulo: string
  materiaId?: string
  data: Timestamp
  /** false = só o dia importa (a hora gravada é 12:00, para não mudar de dia com o fuso) */
  temHora: boolean
  local?: string
  descricao?: string
  concluido: boolean
  checklist: ItemChecklist[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface EventoInput {
  tipo: TipoEvento
  titulo: string
  materiaId: string | null
  data: Date
  temHora: boolean
  local: string
  descricao: string
  checklist: ItemChecklist[]
}

export const LIMITES_EVENTO = { titulo: 60, local: 60, descricao: 500, checklist: 30, item: 80 }

// ── datas ────────────────────────────────────────────────────────────────

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Diferença em dias de calendário (amanhã = 1, ontem = -1), ignorando a hora. */
export function diasAte(data: Date, agora: Date) {
  return Math.round((inicioDoDia(data).getTime() - inicioDoDia(agora).getTime()) / 86_400_000)
}

/** "hoje", "amanhã", "em 3 dias", "ontem", "há 2 dias" */
export function quando(data: Date, agora: Date) {
  const d = diasAte(data, agora)
  if (d === 0) return 'hoje'
  if (d === 1) return 'amanhã'
  if (d === -1) return 'ontem'
  return d > 0 ? `em ${d} dias` : `há ${-d} dias`
}

export interface Grupos {
  atrasados: Evento[]
  semana: Evento[]
  proximos: Evento[]
  concluidos: Evento[]
}

/**
 * Agrupa para a tela da Agenda:
 * - atrasados: não concluídos com data antes de hoje
 * - semana: não concluídos de hoje até 7 dias
 * - proximos: não concluídos depois disso
 * - concluidos: os mais recentes primeiro
 */
export function agrupar(eventos: Evento[], agora: Date): Grupos {
  const g: Grupos = { atrasados: [], semana: [], proximos: [], concluidos: [] }
  const porData = [...eventos].sort((a, b) => a.data.toMillis() - b.data.toMillis())
  for (const e of porData) {
    if (e.concluido) g.concluidos.push(e)
    else {
      const d = diasAte(e.data.toDate(), agora)
      if (d < 0) g.atrasados.push(e)
      else if (d <= 7) g.semana.push(e)
      else g.proximos.push(e)
    }
  }
  g.concluidos.reverse()
  return g
}
