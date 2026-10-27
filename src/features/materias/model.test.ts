import { describe, expect, it } from 'vitest'
import {
  aulaAgoraOuProxima,
  calcularStatus,
  descreverHorario,
  diasDe,
  diaSemanaDe,
  faltasContadas,
  horariosDe,
  ordenarMaterias,
  statusDa,
  type Materia,
} from './model'

describe('calcularStatus', () => {
  it('ok quando ainda pode faltar 2+ vezes', () => {
    const s = calcularStatus(1, 5)
    expect(s.tipo).toBe('ok')
    expect(s.restantes).toBe(4)
    expect(s.mensagem).toBe('Pode faltar mais 4 vezes')
  })

  it('atenção quando só resta 1 falta', () => {
    expect(calcularStatus(4, 5).tipo).toBe('atencao')
  })

  it('limite quando usou todas', () => {
    const s = calcularStatus(5, 5)
    expect(s.tipo).toBe('limite')
    expect(s.restantes).toBe(0)
    expect(s.progresso).toBe(1)
  })

  it('estourou quando passou do limite', () => {
    const s = calcularStatus(7, 5)
    expect(s.tipo).toBe('estourou')
    expect(s.restantes).toBe(0)
    expect(s.mensagem).toBe('Passou 2 faltas do limite')
  })

  it('máximo de 1 falta: zerado é atenção', () => {
    expect(calcularStatus(0, 1).tipo).toBe('atencao')
  })
})

describe('diaSemanaDe', () => {
  it('domingo vira 7 e segunda vira 1', () => {
    expect(diaSemanaDe(new Date(2026, 9, 25))).toBe(7) // domingo
    expect(diaSemanaDe(new Date(2026, 9, 26))).toBe(1) // segunda
  })
})

describe('ordenarMaterias', () => {
  it('ordena por dia e depois por nome', () => {
    const base = { maxFaltas: 5, cor: 'violet' as const, faltas: [] }
    const lista: Materia[] = [
      { ...base, id: '1', nome: 'Química', diaSemana: 3 },
      { ...base, id: '2', nome: 'Biologia', diaSemana: 3 },
      { ...base, id: '3', nome: 'Zoologia', diaSemana: 1 },
    ]
    expect(ordenarMaterias(lista).map((m) => m.id)).toEqual(['3', '2', '1'])
  })
})

describe('faltasContadas', () => {
  it('aula dupla conta 2 e justificada não conta', () => {
    const f = (aulas?: 1 | 2, justificada?: boolean) => ({
      id: 'x',
      data: null,
      aulas,
      justificada,
    })
    expect(faltasContadas([f(), f(2), f(2, true), f(1, true)])).toBe(3)
  })

  it('statusDa usa a contagem ponderada', () => {
    const m = {
      maxFaltas: 4,
      faltas: [
        { id: 'a', data: null, aulas: 2 as const },
        { id: 'b', data: null },
      ],
    }
    expect(statusDa(m).tipo).toBe('atencao') // 3 de 4
  })
})

describe('horários (inclui matérias da v2.0 só com diaSemana)', () => {
  it('horariosDe converte o legado', () => {
    expect(horariosDe({ diaSemana: 3 })).toEqual([{ dia: 3, aulas: 1 }])
    expect(horariosDe({})).toEqual([])
  })

  it('horarios tem prioridade e diasDe não repete', () => {
    const m = {
      diaSemana: 1 as const,
      horarios: [
        { dia: 4 as const, aulas: 1 as const },
        { dia: 2 as const, aulas: 2 as const },
        { dia: 4 as const, aulas: 1 as const, inicio: '08:00' },
      ],
    }
    expect(diasDe(m)).toEqual([2, 4])
  })

  it('descreverHorario', () => {
    expect(descreverHorario({ dia: 1, inicio: '19:00', fim: '20:40', sala: '204', aulas: 2 })).toBe(
      '19:00–20:40 · sala 204 · aula dupla',
    )
    expect(descreverHorario({ dia: 1, aulas: 1 })).toBe('')
  })
})

describe('aulaAgoraOuProxima', () => {
  const base = { maxFaltas: 5, cor: 'pink' as const, faltas: [] }
  const materias: Materia[] = [
    {
      ...base,
      id: 'manha',
      nome: 'Manhã',
      horarios: [{ dia: 2, inicio: '08:00', fim: '09:40', aulas: 1 }],
    },
    { ...base, id: 'noite', nome: 'Noite', horarios: [{ dia: 2, inicio: '19:00', aulas: 1 }] },
    { ...base, id: 'outro-dia', nome: 'Quarta', horarios: [{ dia: 3, inicio: '10:00', aulas: 1 }] },
  ]
  // 27/10/2026 é terça (dia 2)
  it('aula acontecendo agora', () => {
    const r = aulaAgoraOuProxima(materias, new Date(2026, 9, 27, 9, 0))
    expect(r?.materia.id).toBe('manha')
    expect(r?.quando).toBe('agora')
  })
  it('próxima aula do dia', () => {
    const r = aulaAgoraOuProxima(materias, new Date(2026, 9, 27, 12, 0))
    expect(r?.materia.id).toBe('noite')
    expect(r?.quando).toBe('proxima')
  })
  it('sem fim definido considera 50 minutos', () => {
    expect(aulaAgoraOuProxima(materias, new Date(2026, 9, 27, 19, 45))?.quando).toBe('agora')
    expect(aulaAgoraOuProxima(materias, new Date(2026, 9, 27, 19, 55))).toBeNull()
  })
})
