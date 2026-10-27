import { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import type { Evento } from '@/features/agenda/model'
import type { Materia } from '@/features/materias/model'
import { escapar, gerarIcs } from './ics'

const agora = new Date(2026, 9, 27, 10, 0) // terça

const materia: Materia = {
  id: 'm1',
  nome: 'Anatomia, Humana',
  maxFaltas: 5,
  cor: 'pink',
  faltas: [],
  horarios: [
    { dia: 4, inicio: '19:00', fim: '20:40', sala: '204', aulas: 2 },
    { dia: 1, aulas: 1 }, // sem hora: não entra na agenda
  ],
  professor: { nome: 'Dra. Ana' },
}

const evento = (over: Partial<Evento>): Evento => ({
  id: 'e1',
  tipo: 'prova',
  titulo: 'P1',
  materiaId: 'm1',
  data: Timestamp.fromDate(new Date(2026, 10, 5, 12, 0)),
  temHora: false,
  concluido: false,
  checklist: [],
  ...over,
})

describe('gerarIcs', () => {
  const ics = gerarIcs({
    materias: [materia],
    eventos: [
      evento({}),
      evento({ id: 'e2', temHora: true, data: Timestamp.fromDate(new Date(2026, 10, 6, 8, 30)) }),
    ],
    semestreFim: '2026-12-15',
    agora,
  })
  const linhas = ics.split('\r\n')

  it('estrutura básica com CRLF', () => {
    expect(linhas[0]).toBe('BEGIN:VCALENDAR')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(linhas.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(3)
  })

  it('aula semanal começa na primeira quinta e vai até o fim do semestre', () => {
    expect(linhas).toContain('DTSTART:20261029T190000')
    expect(linhas).toContain('DTEND:20261029T204000')
    expect(linhas).toContain('RRULE:FREQ=WEEKLY;UNTIL=20261215T235959')
    expect(linhas).toContain('LOCATION:Sala 204')
    expect(linhas).toContain('SUMMARY:Anatomia\\, Humana')
  })

  it('evento só com data vira dia inteiro; com hora dura 1h', () => {
    expect(linhas).toContain('DTSTART;VALUE=DATE:20261105')
    expect(linhas).toContain('DTEND;VALUE=DATE:20261106')
    expect(linhas).toContain('DTSTART:20261106T083000')
    expect(linhas).toContain('DTEND:20261106T093000')
  })

  it('sem fim de semestre usa 20 semanas', () => {
    const s = gerarIcs({ materias: [materia], eventos: [], agora })
    expect(s).toContain('RRULE:FREQ=WEEKLY;COUNT=20')
  })

  it('dobra linhas longas', () => {
    const s = gerarIcs({ materias: [], eventos: [evento({ descricao: 'x'.repeat(200) })], agora })
    expect(s.split('\r\n').every((l) => l.length <= 75)).toBe(true)
  })
})

describe('escapar', () => {
  it('escapa caracteres especiais', () => {
    expect(escapar('a;b,c\\d\ne')).toBe('a\\;b\\,c\\\\d\\ne')
  })
})
