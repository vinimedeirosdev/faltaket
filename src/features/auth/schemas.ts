import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Informe seu usuário'),
  senha: z.string().min(1, 'Informe sua senha'),
})
export type LoginDados = z.infer<typeof loginSchema>

export const senhaNova = z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres').max(128)

export const cadastroSchema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome').max(40, 'Máximo de 40 caracteres'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Mínimo de 3 caracteres')
    .max(30, 'Máximo de 30 caracteres')
    .regex(/^[a-z0-9._-]+$/, 'Use só letras, números, ponto, hífen ou _'),
  senha: senhaNova,
})
export type CadastroDados = z.infer<typeof cadastroSchema>

export const trocarSenhaSchema = z
  .object({
    atual: z.string().min(1, 'Informe a senha atual'),
    nova: senhaNova,
    confirmar: z.string(),
  })
  .refine((d) => d.nova === d.confirmar, { message: 'As senhas não conferem', path: ['confirmar'] })
export type TrocarSenhaDados = z.infer<typeof trocarSenhaSchema>
