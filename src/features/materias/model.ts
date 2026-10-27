import type { Timestamp } from 'firebase/firestore'

// Espelha o contrato do Firestore (ver docs/DATA_MODEL.md e firestore.rules no faltaket-server)

export interface Falta {
  id: string
  /** null = falta migrada da v1, sem data conhecida */
  data: Timestamp | null
  obs?: string
}

export interface Materia {
  id: string
  nome: string
  diaSemana: DiaSemana
  maxFaltas: number
  cor: Cor
  faltas: Falta[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type MateriaInput = Pick<Materia, 'nome' | 'diaSemana' | 'maxFaltas' | 'cor'>

export const LIMITES = {
  nome: 40,
  obs: 140,
  maxFaltas: 99,
  faltasRegistradas: 200,
} as const

// ── Dias da semana (1 = segunda ... 7 = domingo, igual à v1) ──────────────

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const DIAS: { valor: DiaSemana; curto: string; nome: string }[] = [
  { valor: 1, curto: 'Seg', nome: 'Segunda-feira' },
  { valor: 2, curto: 'Ter', nome: 'Terça-feira' },
  { valor: 3, curto: 'Qua', nome: 'Quarta-feira' },
  { valor: 4, curto: 'Qui', nome: 'Quinta-feira' },
  { valor: 5, curto: 'Sex', nome: 'Sexta-feira' },
  { valor: 6, curto: 'Sáb', nome: 'Sábado' },
  { valor: 7, curto: 'Dom', nome: 'Domingo' },
]

export function nomeDoDia(dia: number) {
  return DIAS.find((d) => d.valor === dia)?.nome ?? ''
}

/** Converte Date.getDay() (0 = domingo) para o padrão do app (7 = domingo). */
export function diaSemanaDe(date: Date): DiaSemana {
  const d = date.getDay()
  return (d === 0 ? 7 : d) as DiaSemana
}

// ── Cores ────────────────────────────────────────────────────────────────

export const CORES = [
  'violet',
  'pink',
  'rose',
  'amber',
  'emerald',
  'sky',
  'indigo',
  'teal',
] as const
export type Cor = (typeof CORES)[number]

/** Classes Tailwind por cor (escritas por extenso para o Tailwind detectar). */
export const COR_CLASSES: Record<Cor, { dot: string; soft: string; text: string }> = {
  violet: {
    dot: 'bg-violet-500',
    soft: 'bg-violet-500/12',
    text: 'text-violet-600 dark:text-violet-300',
  },
  pink: { dot: 'bg-pink-500', soft: 'bg-pink-500/12', text: 'text-pink-600 dark:text-pink-300' },
  rose: { dot: 'bg-rose-500', soft: 'bg-rose-500/12', text: 'text-rose-600 dark:text-rose-300' },
  amber: {
    dot: 'bg-amber-500',
    soft: 'bg-amber-500/14',
    text: 'text-amber-700 dark:text-amber-300',
  },
  emerald: {
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-500/12',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  sky: { dot: 'bg-sky-500', soft: 'bg-sky-500/12', text: 'text-sky-700 dark:text-sky-300' },
  indigo: {
    dot: 'bg-indigo-500',
    soft: 'bg-indigo-500/12',
    text: 'text-indigo-600 dark:text-indigo-300',
  },
  teal: { dot: 'bg-teal-500', soft: 'bg-teal-500/12', text: 'text-teal-700 dark:text-teal-300' },
}

// ── Status ───────────────────────────────────────────────────────────────

export type StatusTipo = 'ok' | 'atencao' | 'limite' | 'estourou'

export interface Status {
  tipo: StatusTipo
  usadas: number
  restantes: number
  /** 0..1 (pode passar de 1 quando estourou) */
  progresso: number
  mensagem: string
}

/**
 * Regras (as mesmas da v1, agora explícitas):
 * - ok:       ainda pode faltar 2 ou mais vezes
 * - atencao:  só pode faltar mais 1 vez
 * - limite:   usou todas as faltas permitidas
 * - estourou: passou do limite
 */
export function calcularStatus(usadas: number, maxFaltas: number): Status {
  const restantes = maxFaltas - usadas
  const progresso = maxFaltas > 0 ? usadas / maxFaltas : 1

  if (restantes < 0) {
    const passou = -restantes
    return {
      tipo: 'estourou',
      usadas,
      restantes: 0,
      progresso,
      mensagem: `Passou ${passou} ${passou === 1 ? 'falta' : 'faltas'} do limite`,
    }
  }
  if (restantes === 0) {
    return { tipo: 'limite', usadas, restantes, progresso, mensagem: 'Não pode faltar mais' }
  }
  if (restantes === 1) {
    return { tipo: 'atencao', usadas, restantes, progresso, mensagem: 'Só pode faltar mais 1 vez' }
  }
  return {
    tipo: 'ok',
    usadas,
    restantes,
    progresso,
    mensagem: `Pode faltar mais ${restantes} vezes`,
  }
}

export const STATUS_CLASSES: Record<
  StatusTipo,
  { text: string; bg: string; stroke: string; label: string }
> = {
  ok: { text: 'text-ok', bg: 'bg-ok/12', stroke: 'stroke-ok', label: 'Tranquilo' },
  atencao: { text: 'text-warn', bg: 'bg-warn/15', stroke: 'stroke-warn', label: 'Atenção' },
  limite: { text: 'text-danger', bg: 'bg-danger/12', stroke: 'stroke-danger', label: 'No limite' },
  estourou: { text: 'text-danger', bg: 'bg-danger/15', stroke: 'stroke-danger', label: 'Estourou' },
}

export function emRisco(m: Pick<Materia, 'faltas' | 'maxFaltas'>) {
  return calcularStatus(m.faltas.length, m.maxFaltas).tipo !== 'ok'
}

/** Ordena por dia da semana e depois por nome. */
export function ordenarMaterias(materias: Materia[]) {
  return [...materias].sort(
    (a, b) => a.diaSemana - b.diaSemana || a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}
