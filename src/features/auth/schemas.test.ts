import { describe, expect, it } from 'vitest'
import { usernameToEmail } from '@/lib/username'
import { cadastroSchema, trocarSenhaSchema } from './schemas'

describe('cadastroSchema', () => {
  it('normaliza o usuário para minúsculas', () => {
    const r = cadastroSchema.parse({ nome: 'Ketlen', username: '  Ketlen  ', senha: '123456' })
    expect(r.username).toBe('ketlen')
  })

  it('recusa caracteres inválidos no usuário', () => {
    expect(
      cadastroSchema.safeParse({ nome: 'A', username: 'com espaço', senha: '123456' }).success,
    ).toBe(false)
  })

  it('exige senha com 6+ caracteres', () => {
    expect(cadastroSchema.safeParse({ nome: 'A', username: 'abc', senha: '123' }).success).toBe(
      false,
    )
  })
})

describe('trocarSenhaSchema', () => {
  it('exige confirmação igual', () => {
    expect(
      trocarSenhaSchema.safeParse({ atual: 'x', nova: '123456', confirmar: '1234567' }).success,
    ).toBe(false)
  })
})

describe('usernameToEmail', () => {
  it('é estável para usuários simples', () => {
    expect(usernameToEmail(' Ketlen ', 'faltaket.app')).toBe('ketlen@faltaket.app')
  })

  it('codifica caracteres fora do padrão (usuários antigos)', () => {
    expect(usernameToEmail('joão silva', 'x.app')).toBe('jo+e3o+20silva@x.app')
  })
})
