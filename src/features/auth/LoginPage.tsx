import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, PasswordInput } from '@/components/ui/input'
import { entrar, mensagemDeErro } from './api'
import { AuthLayout } from './AuthLayout'
import { loginSchema, type LoginDados } from './schemas'

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDados>({ resolver: zodResolver(loginSchema) })

  async function onSubmit({ username, senha }: LoginDados) {
    try {
      await entrar(username, senha)
      // o redirecionamento acontece no router quando o AuthProvider detecta o login
    } catch (e) {
      toast.error(mensagemDeErro(e))
    }
  }

  return (
    <AuthLayout titulo="Que bom te ver!" subtitulo="Entre para ver suas faltas">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field id="username" label="Usuário" erro={errors.username?.message}>
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
        <Field id="senha" label="Senha" erro={errors.senha?.message}>
          <PasswordInput
            id="senha"
            autoComplete="current-password"
            aria-invalid={!!errors.senha}
            {...register('senha')}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Entrar
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="text-primary font-semibold hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
