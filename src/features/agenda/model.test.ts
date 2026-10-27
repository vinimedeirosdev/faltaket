import { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import { agrupar, diasAte, quando, type Evento } from './model'

const agora = new Date(2026, 9, 27, 15, 0) // terça, 27/10/2026 15:00

const ev = (id: string, data: Date, concluido = false): Evento => ({
  id,
  tipo: 'prova',
  titulo: id,
  data: Timestamp.fromDate(data),
  temHora: false,
  concluido,
  checklist: [],
})

describe('diasAte / quando', () => {
  it('ignora a hora do dia', () => {
    expect(diasAte(new Date(2026, 9, 28, 1, 0), agora)).toBe(1)
    expect(diasAte(new Date(2026, 9, 27, 23, 59), agora)).toBe(0)
  })

  it('textos', () => {
    expect(quando(new Date(2026, 9, 27), agora)).toBe('hoje')
    expect(quando(new Date(2026, 9, 28), agora)).toBe('amanhã')
    expect(quando(new Date(2026, 9, 30), agora)).toBe('em 3 dias')
    expect(quando(new Date(2026, 9, 26), agora)).toBe('ontem')
    expect(quando(new Date(2026, 9, 20), agora)).toBe('há 7 dias')
  })

  it('atravessa mudança de mês', () => {
    expect(diasAte(new Date(2026, 10, 2), agora)).toBe(6)
  })
})

describe('agrupar', () => {
  it('separa atrasados, semana, próximos e concluídos', () => {
    const g = agrupar(
      [
        ev('futuro', new Date(2026, 10, 20)),
        ev('ontem', new Date(2026, 9, 26)),
        ev('sexta', new Date(2026, 9, 30)),
        ev('hoje', new Date(2026, 9, 27, 8)),
        ev('feito', new Date(2026, 9, 29), true),
      ],
      agora,
    )
    expect(g.atrasados.map((e) => e.id)).toEqual(['ontem'])
    expect(g.semana.map((e) => e.id)).toEqual(['hoje', 'sexta'])
    expect(g.proximos.map((e) => e.id)).toEqual(['futuro'])
    expect(g.concluidos.map((e) => e.id)).toEqual(['feito'])
  })
})
