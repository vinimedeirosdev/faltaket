import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronRight,
  Download,
  Heart,
  KeyRound,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Pencil,
  Share,
  Sun,
  Trash2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTema, type Tema } from '@/app/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Confirm } from '@/components/ui/confirm'
import { Field, Input, PasswordInput } from '@/components/ui/input'
import { FotoPerfil } from './FotoPerfil'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { atualizarNome, excluirConta, mensagemDeErro, sair, trocarSenha } from '../auth/api'
import { useUsuario } from '../auth/AuthProvider'
import { trocarSenhaSchema, type TrocarSenhaDados } from '../auth/schemas'
import { useInstalarApp } from '../pwa/pwa'

export function PerfilPage() {
  const { nome, username, foto, termo } = useUsuario()
  const { tema, setTema } = useTema()
  const pwa = useInstalarApp()
  const [modal, setModal] = useState<'nome' | 'senha' | 'excluir' | null>(null)
  const [senhaExclusao, setSenhaExclusao] = useState('')
  const fechar = () => setModal(null)

  async function confirmarExclusao() {
    try {
      await excluirConta(senhaExclusao)
      toast('Conta excluída. Até logo 👋')
    } catch (e) {
      toast.error(mensagemDeErro(e))
    } finally {
      setSenhaExclusao('')
    }
  }

  return (
    <div className="mx-auto grid max-w-lg gap-6 pt-4">
      <section className="flex flex-col items-center gap-3 text-center">
        <FotoPerfil nome={nome} foto={foto} />
        <div>
          <h1 className="text-2xl font-bold">{nome}</h1>
          <p className="text-muted-foreground text-sm">@{username}</p>
        </div>
      </section>

      <Grupo titulo="Conta">
        <Item icone={<Pencil />} onClick={() => setModal('nome')}>
          Alterar nome
        </Item>
        <Item icone={<KeyRound />} onClick={() => setModal('senha')}>
          Alterar senha
        </Item>
        {termo && (
          <Item icone={<Heart className="text-pink-500" />} asLink="/termo">
            Termo de Compromisso
          </Item>
        )}
      </Grupo>

      <Grupo titulo="Aparência">
        <div className="grid grid-cols-3 gap-1.5 p-2">
          {(
            [
              { v: 'light', label: 'Claro', icon: Sun },
              { v: 'dark', label: 'Escuro', icon: Moon },
              { v: 'system', label: 'Sistema', icon: Monitor },
            ] as { v: Tema; label: string; icon: typeof Sun }[]
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => setTema(o.v)}
              aria-pressed={tema === o.v}
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors',
                tema === o.v
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <o.icon className="size-5" />
              {o.label}
            </button>
          ))}
        </div>
      </Grupo>

      {!pwa.instalado && (pwa.podeInstalar || pwa.ios) && (
        <Grupo titulo="App">
          {pwa.podeInstalar ? (
            <Item icone={<Download />} onClick={pwa.instalar}>
              Instalar o Faltaket no celular
            </Item>
          ) : (
            <div className="text-muted-foreground flex items-start gap-3 p-4 text-sm">
              <Share className="mt-0.5 size-5 shrink-0" />
              <p>
                Para instalar no iPhone: toque em <strong>Compartilhar</strong> e depois em{' '}
                <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
          )}
        </Grupo>
      )}

      <Grupo>
        <Item icone={<LogOut />} onClick={() => sair()}>
          Sair
        </Item>
        <Item icone={<Trash2 />} onClick={() => setModal('excluir')} destrutivo>
          Excluir conta
        </Item>
      </Grupo>

      <p className="text-muted-foreground text-center text-xs">
        Faltaket v{__APP_VERSION__} · feito com 💜
      </p>

      <Modal open={modal === 'nome'} onOpenChange={(o) => !o && fechar()} titulo="Alterar nome">
        <FormNome nomeAtual={nome} onPronto={fechar} />
      </Modal>

      <Modal open={modal === 'senha'} onOpenChange={(o) => !o && fechar()} titulo="Alterar senha">
        <FormSenha onPronto={fechar} />
      </Modal>

      <Confirm
        open={modal === 'excluir'}
        onOpenChange={(o) => {
          if (!o) {
            fechar()
            setSenhaExclusao('')
          }
        }}
        titulo="Excluir conta?"
        descricao="Todas as suas matérias e faltas serão apagadas para sempre. Digite sua senha para confirmar."
        confirmar="Excluir conta"
        onConfirm={confirmarExclusao}
        bloqueado={!senhaExclusao}
      >
        <PasswordInput
          aria-label="Senha"
          placeholder="Sua senha"
          autoComplete="current-password"
          value={senhaExclusao}
          onChange={(e) => setSenhaExclusao(e.target.value)}
        />
      </Confirm>
    </div>
  )
}

function Grupo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section>
      {titulo && (
        <h2 className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
          {titulo}
        </h2>
      )}
      <div className="bg-card divide-y overflow-hidden rounded-2xl border">{children}</div>
    </section>
  )
}

function Item({
  icone,
  children,
  onClick,
  asLink,
  destrutivo,
}: {
  icone: ReactNode
  children: ReactNode
  onClick?: () => void
  asLink?: string
  destrutivo?: boolean
}) {
  const cls = cn(
    'hover:bg-muted flex h-14 w-full items-center gap-3 px-4 text-left text-sm font-medium transition-colors [&>svg:first-child]:size-5',
    destrutivo && 'text-destructive',
  )
  const conteudo = (
    <>
      {icone}
      <span className="flex-1">{children}</span>
      <ChevronRight className="text-muted-foreground size-4" />
    </>
  )
  return asLink ? (
    <Link to={asLink} className={cls}>
      {conteudo}
    </Link>
  ) : (
    <button className={cls} onClick={onClick}>
      {conteudo}
    </button>
  )
}

const nomeSchema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome').max(40, 'Máximo de 40 caracteres'),
})

function FormNome({ nomeAtual, onPronto }: { nomeAtual: string; onPronto: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(nomeSchema), defaultValues: { nome: nomeAtual } })

  async function onSubmit({ nome }: { nome: string }) {
    try {
      await atualizarNome(nome)
      toast.success('Nome atualizado!')
      onPronto()
    } catch (e) {
      toast.error(mensagemDeErro(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field id="novo-nome" label="Nome" erro={errors.nome?.message}>
        <Input
          id="novo-nome"
          autoComplete="name"
          aria-invalid={!!errors.nome}
          {...register('nome')}
        />
      </Field>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Salvar
      </Button>
    </form>
  )
}

function FormSenha({ onPronto }: { onPronto: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrocarSenhaDados>({ resolver: zodResolver(trocarSenhaSchema) })

  async function onSubmit({ atual, nova }: TrocarSenhaDados) {
    try {
      await trocarSenha(atual, nova)
      toast.success('Senha alterada!')
      onPronto()
    } catch (e) {
      toast.error(mensagemDeErro(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field id="atual" label="Senha atual" erro={errors.atual?.message}>
        <PasswordInput
          id="atual"
          autoComplete="current-password"
          aria-invalid={!!errors.atual}
          {...register('atual')}
        />
      </Field>
      <Field id="nova" label="Nova senha" erro={errors.nova?.message}>
        <PasswordInput
          id="nova"
          autoComplete="new-password"
          aria-invalid={!!errors.nova}
          {...register('nova')}
        />
      </Field>
      <Field id="confirmar" label="Confirmar nova senha" erro={errors.confirmar?.message}>
        <PasswordInput
          id="confirmar"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmar}
          {...register('confirmar')}
        />
      </Field>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Alterar senha
      </Button>
    </form>
  )
}
