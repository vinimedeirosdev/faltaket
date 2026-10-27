import { describe, expect, it } from 'vitest'
import type { Nota } from '../materias/model'
import { calcularNotas } from './calculo'

const n = (nome: string, peso: number, valor: number | null): Nota => ({
  id: nome,
  nome,
  peso,
  valor,
})

describe('calcularNotas', () => {
  it('sem notas', () => {
    expect(calcularNotas([], 7).situacao).toBe('sem-notas')
  })

  it('média ponderada das lançadas', () => {
    const r = calcularNotas([n('P1', 2, 8), n('P2', 1, 5)], 7)
    expect(r.media).toBeCloseTo(7)
    expect(r.situacao).toBe('aprovada')
  })

  it('quanto precisa tirar na única prova que falta', () => {
    // (7*2 - 6*1) / 1 = 8
    const r = calcularNotas([n('P1', 1, 6), n('P2', 1, null)], 7)
    expect(r.precisa).toBe(8)
    expect(r.mensagem).toBe('Precisa tirar 8,0 na P2')
  })

  it('arredonda para cima e considera pesos', () => {
    // meta 6, total peso 3: (18 - 5.5*1) / 2 = 6.25 → 6.3
    const r = calcularNotas([n('P1', 1, 5.5), n('P2', 1, null), n('T1', 1, null)], 6)
    expect(r.precisa).toBe(6.3)
    expect(r.mensagem).toBe('Precisa tirar 6,3 de média nas 2 que faltam')
  })

  it('já aprovada mesmo tirando zero', () => {
    const r = calcularNotas([n('P1', 3, 10), n('P2', 1, null)], 7)
    expect(r.situacao).toBe('aprovada')
    expect(r.precisa).toBe(0)
  })

  it('impossível chegar na média', () => {
    const r = calcularNotas([n('P1', 3, 2), n('P2', 1, null)], 7, 5)
    expect(r.situacao).toBe('andamento')
    expect(r.precisa).toBeGreaterThan(10)
    expect(r.mensagem).toContain('foco no exame')
  })

  it('final: exame quando fica entre mediaExame e a meta', () => {
    const r = calcularNotas([n('P1', 1, 5), n('P2', 1, 6)], 7, 4)
    expect(r.situacao).toBe('exame')
  })

  it('final: reprovada abaixo do exame', () => {
    expect(calcularNotas([n('P1', 1, 2), n('P2', 1, 3)], 7, 4).situacao).toBe('reprovada')
  })

  it('ignora avaliações com peso 0', () => {
    const r = calcularNotas([n('P1', 1, 8), n('Extra', 0, null)], 7)
    expect(r.situacao).toBe('aprovada')
  })
})
