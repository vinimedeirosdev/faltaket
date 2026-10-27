import { TIPO_INFO, type Evento } from '@/features/agenda/model'
import { horariosDe, minutos, type Materia } from '@/features/materias/model'

// Gera um arquivo .ics (iCalendar, RFC 5545) para importar no Google Agenda,
// Apple Calendário ou Outlook. Tudo no navegador, sem servidor.
// Horários "flutuantes" (sem fuso): o calendário usa o fuso de quem importa.

const SEMANAS_PADRAO = 20

const p2 = (n: number) => String(n).padStart(2, '0')
const data = (d: Date) => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`
const dataHora = (d: Date) => `${data(d)}T${p2(d.getHours())}${p2(d.getMinutes())}00`
const utc = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

/** Escapa texto conforme a RFC 5545 (\\ ; , e quebras de linha). */
export function escapar(texto: string) {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Linhas com mais de 75 caracteres são "dobradas" (continuação começa com espaço). */
function dobrar(linha: string) {
  const partes: string[] = []
  let resto = linha
  while (resto.length > 75) {
    partes.push(resto.slice(0, 75))
    resto = ' ' + resto.slice(75)
  }
  partes.push(resto)
  return partes.join('\r\n')
}

/** "AAAA-MM-DD" → Date local (meia-noite) */
const lerDia = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export interface OpcoesIcs {
  materias: Materia[]
  eventos: Evento[]
  semestreInicio?: string
  semestreFim?: string
  agora?: Date
}

export function gerarIcs({
  materias,
  eventos,
  semestreInicio,
  semestreFim,
  agora = new Date(),
}: OpcoesIcs) {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FaltaKet//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FaltaKet',
  ]
  const stamp = utc(agora)
  const inicio = semestreInicio
    ? lerDia(semestreInicio)
    : new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const ate = semestreFim ? `UNTIL=${data(lerDia(semestreFim))}T235959` : `COUNT=${SEMANAS_PADRAO}`

  // ── aulas: um evento semanal por horário (só os que têm hora de início) ──
  for (const m of materias) {
    horariosDe(m).forEach((h, i) => {
      if (!h.inicio) return
      // primeira ocorrência daquele dia da semana a partir do início
      const primeiro = new Date(inicio)
      const diaJs = h.dia % 7 // 7 (domingo) → 0
      primeiro.setDate(primeiro.getDate() + ((diaJs - primeiro.getDay() + 7) % 7))
      const ini = minutos(h.inicio)
      const fim = h.fim ? minutos(h.fim) : ini + 50
      const dIni = new Date(primeiro)
      dIni.setHours(Math.floor(ini / 60), ini % 60)
      const dFim = new Date(primeiro)
      dFim.setHours(Math.floor(fim / 60), fim % 60)

      linhas.push(
        'BEGIN:VEVENT',
        `UID:aula-${m.id}-${i}@faltaket.app`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dataHora(dIni)}`,
        `DTEND:${dataHora(dFim)}`,
        `RRULE:FREQ=WEEKLY;${ate}`,
        `SUMMARY:${escapar(m.nome)}`,
        ...(h.sala ? [`LOCATION:${escapar(`Sala ${h.sala}`)}`] : []),
        ...(m.professor ? [`DESCRIPTION:${escapar(`Professor(a): ${m.professor.nome}`)}`] : []),
        'END:VEVENT',
      )
    })
  }

  // ── provas, trabalhos e entregas ──
  for (const e of eventos) {
    const d = e.data.toDate()
    const materia = materias.find((m) => m.id === e.materiaId)
    const titulo = `${TIPO_INFO[e.tipo].emoji} ${e.titulo}${materia ? ` (${materia.nome})` : ''}`
    const quando = e.temHora
      ? [`DTSTART:${dataHora(d)}`, `DTEND:${dataHora(new Date(d.getTime() + 3_600_000))}`]
      : [
          `DTSTART;VALUE=DATE:${data(d)}`,
          `DTEND;VALUE=DATE:${data(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}`,
        ]
    linhas.push(
      'BEGIN:VEVENT',
      `UID:evento-${e.id}@faltaket.app`,
      `DTSTAMP:${stamp}`,
      ...quando,
      `SUMMARY:${escapar(titulo)}`,
      ...(e.local ? [`LOCATION:${escapar(e.local)}`] : []),
      ...(e.descricao ? [`DESCRIPTION:${escapar(e.descricao)}`] : []),
      ...(e.concluido ? ['STATUS:CANCELLED'] : []),
      'END:VEVENT',
    )
  }

  linhas.push('END:VCALENDAR')
  return linhas.map(dobrar).join('\r\n') + '\r\n'
}

/** Dispara o download do arquivo no navegador. */
export function baixarIcs(conteudo: string, nome = 'faltaket.ics') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
