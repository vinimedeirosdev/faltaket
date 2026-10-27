import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, PasswordInput } from '@/components/ui/input'
import { cadastrar, mensagemDeErro } from './api'
import { AuthLayout } from './AuthLayout'
import { cadastroSchema, type CadastroDados } from './schemas'

export function CadastroPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroDados>({ resolver: zodResolver(cadastroSchema) })

  async function onSubmit({ nome, username, senha }: CadastroDados) {
    try {
      await cadastrar(nome, username, senha)
      toast.success('Conta criada! Bem-vinda(o) 💜')
    } catch (e) {
      toast.error(mensagemDeErro(e))
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Leva menos de um minuto">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field id="nome" label="Seu nome" erro={errors.nome?.message}>
          <Input id="nome" autoComplete="name" aria-invalid={!!errors.nome} {...register('nome')} />
        </Field>
        <Field
          id="username"
          label="Usuário"
          erro={errors.username?.message}
          dica="Você vai usar para entrar. Letras, números, . - _"
        >
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!errors.username}
            {...register('username')}
          />
        </Field>
        <Field id="senha" label="Senha" erro={errors.senha?.message} dica="Mínimo de 6 caracteres">
          <PasswordInput
            id="senha"
            autoComplete="new-password"
            aria-invalid={!!errors.senha}
            {...register('senha')}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Criar conta
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Já tem conta?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
