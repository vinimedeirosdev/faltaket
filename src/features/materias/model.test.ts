import { describe, expect, it } from 'vitest'
import { calcularStatus, diaSemanaDe, ordenarMaterias, type Materia } from './model'

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
