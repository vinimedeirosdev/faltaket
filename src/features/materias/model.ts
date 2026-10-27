import type { Timestamp } from 'firebase/firestore'

// Espelha o contrato do Firestore (ver docs/DATA_MODEL.md e firestore.rules no faltaket-server)

export interface Falta {
  id: string
  /** null = falta migrada da v1, sem data conhecida */
  data: Timestamp | null
  obs?: string
  /** 2 = faltou numa aula dupla (conta 2). Ausente = 1. */
  aulas?: 1 | 2
  /** atestado/abono: aparece no histórico mas não conta no limite */
  justificada?: boolean
}

export interface Horario {
  dia: DiaSemana
  /** "HH:MM" */
  inicio?: string
  fim?: string
  sala?: string
  /** 2 = aula dupla */
  aulas: 1 | 2
}

export interface Professor {
  nome: string
  email?: string
}

export interface Nota {
  id: string
  nome: string
  peso: number
  /** null = ainda não saiu */
  valor: number | null
}

export interface Materia {
  id: string
  nome: string
  /** formato da v2.0: substituído por `horarios`. Use sempre horariosDe(). */
  diaSemana?: DiaSemana
  horarios?: Horario[]
  maxFaltas: number
  cor: Cor
  faltas: Falta[]
  professor?: Professor
  notas?: Nota[]
  /** sobrescreve a média de aprovação do perfil só nesta matéria */
  mediaAprovacao?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/** Dados editáveis no formulário (as faltas e as notas têm telas próprias). */
export interface MateriaInput {
  nome: string
  horarios: Horario[]
  maxFaltas: number
  cor: Cor
  professor: Professor | null
}

export const LIMITES = {
  nome: 40,
  obs: 140,
  maxFaltas: 99,
  faltasRegistradas: 200,
  horarios: 14,
  sala: 30,
  professor: 60,
  email: 100,
  notas: 30,
  notaNome: 20,
} as const

// ── Horários ─────────────────────────────────────────────────────────────

/** Horários da matéria, inclusive das criadas na v2.0 (só com `diaSemana`). */
export function horariosDe(m: Pick<Materia, 'horarios' | 'diaSemana'>): Horario[] {
  if (m.horarios?.length) return m.horarios
  return m.diaSemana ? [{ dia: m.diaSemana, aulas: 1 }] : []
}

/** Dias (sem repetição, em ordem) em que a matéria tem aula. */
export function diasDe(m: Pick<Materia, 'horarios' | 'diaSemana'>): DiaSemana[] {
  return [...new Set(horariosDe(m).map((h) => h.dia))].sort((a, b) => a - b)
}

/** Horários da matéria num dia específico, ordenados pelo início. */
export function horariosNoDia(m: Pick<Materia, 'horarios' | 'diaSemana'>, dia: DiaSemana) {
  return horariosDe(m)
    .filter((h) => h.dia === dia)
    .sort((a, b) => (a.inicio ?? '99').localeCompare(b.inicio ?? '99'))
}

/** "19:00–20:40 · sala 204 · aula dupla" (partes vazias somem). */
export function descreverHorario(h: Horario) {
  const hora = h.inicio ? (h.fim ? `${h.inicio}–${h.fim}` : h.inicio) : ''
  return [hora, h.sala && `sala ${h.sala}`, h.aulas === 2 && 'aula dupla']
    .filter(Boolean)
    .join(' · ')
}

/** "HH:MM" → minutos desde 00:00 */
export function minutos(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// ── Faltas ───────────────────────────────────────────────────────────────

/** Quantas faltas contam para o limite: aula dupla vale 2, justificada vale 0. */
export function faltasContadas(faltas: Falta[]) {
  return faltas.reduce((s, f) => s + (f.justificada ? 0 : (f.aulas ?? 1)), 0)
}

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

/** Status da matéria considerando aula dupla e faltas justificadas. */
export function statusDa(m: Pick<Materia, 'faltas' | 'maxFaltas'>) {
  return calcularStatus(faltasContadas(m.faltas), m.maxFaltas)
}

export function emRisco(m: Pick<Materia, 'faltas' | 'maxFaltas'>) {
  return statusDa(m).tipo !== 'ok'
}

/** Ordena pelo primeiro dia de aula, depois horário e nome. */
export function ordenarMaterias(materias: Materia[]) {
  const chave = (m: Materia) => {
    const h = [...horariosDe(m)].sort(
      (a, b) => a.dia - b.dia || (a.inicio ?? '').localeCompare(b.inicio ?? ''),
    )[0]
    return h ? `${h.dia}${h.inicio ?? '99:99'}` : '9'
  }
  return [...materias].sort(
    (a, b) => chave(a).localeCompare(chave(b)) || a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}

/**
 * Aula acontecendo agora ou a próxima de hoje (só horários com início definido).
 * Fim desconhecido = considera 50 minutos.
 */
export function aulaAgoraOuProxima(materias: Materia[], agora: Date) {
  const dia = diaSemanaDe(agora)
  const atual = agora.getHours() * 60 + agora.getMinutes()
  const doDia = materias
    .flatMap((m) => horariosNoDia(m, dia).map((h) => ({ materia: m, horario: h })))
    .filter((x) => x.horario.inicio)
    .sort((a, b) => minutos(a.horario.inicio!) - minutos(b.horario.inicio!))

  for (const x of doDia) {
    const ini = minutos(x.horario.inicio!)
    const fim = x.horario.fim ? minutos(x.horario.fim) : ini + 50
    if (atual >= ini && atual < fim) return { ...x, quando: 'agora' as const }
    if (atual < ini) return { ...x, quando: 'proxima' as const }
  }
  return null
}
