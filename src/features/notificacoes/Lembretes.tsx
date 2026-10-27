import { BellOff, BellRing, Loader2, Share } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { atualizarConfig, mensagemDeErro } from '../auth/api'
import { useUsuario } from '../auth/AuthProvider'
import {
  ativarLembretes,
  desativarLembretes,
  ehInstalado,
  ehIos,
  estadoLembretes,
  ouvirEmPrimeiroPlano,
  type EstadoLembretes,
} from './push'

const TIPOS = [
  { chave: 'aulas', rotulo: 'Aulas do dia', dica: 'De manhã: o que tem hoje, horário e sala' },
  { chave: 'provas', rotulo: 'Provas', dica: 'Na véspera, às 18h' },
  { chave: 'entregas', rotulo: 'Trabalhos e entregas', dica: 'Na véspera e 3 dias antes' },
  { chave: 'risco', rotulo: 'Limite de faltas', dica: 'Quando só puder faltar mais 1 vez' },
] as const

/** Perfil → "Lembretes": ativar neste aparelho e escolher os tipos. */
export function Lembretes() {
  const { uid, config } = useUsuario()
  const [estado, setEstado] = useState<EstadoLembretes | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    estadoLembretes().then(setEstado)
  }, [])

  async function alternar() {
    setOcupado(true)
    try {
      if (estado === 'ativo') {
        await desativarLembretes(uid)
        toast('Lembretes desligados neste aparelho')
      } else {
        await ativarLembretes(uid)
        toast.success('Lembretes ligados! 🔔')
      }
    } catch (e) {
      toast.error(mensagemDeErro(e))
    } finally {
      setEstado(await estadoLembretes())
      setOcupado(false)
    }
  }

  function mudarTipo(chave: (typeof TIPOS)[number]['chave'], valor: boolean) {
    atualizarConfig({ notificacoes: { ...config.notificacoes, [chave]: valor } }).catch((e) => {
      console.error(e)
      toast.error('Não foi possível salvar. Tente de novo.')
    })
  }

  if (estado === null) return <div className="h-16" />

  if (estado === 'sem-config') {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Lembretes ainda não configurados neste app (falta a chave Web Push).
      </p>
    )
  }

  if (estado === 'indisponivel' && ehIos() && !ehInstalado()) {
    return (
      <div className="text-muted-foreground flex items-start gap-3 p-4 text-sm">
        <Share className="mt-0.5 size-5 shrink-0" />
        <p>
          No iPhone, os lembretes funcionam com o app instalado: toque em{' '}
          <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong> e abra o
          FaltaKet por lá.
        </p>
      </div>
    )
  }

  if (estado === 'indisponivel') {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Este navegador não suporta notificações. Tente pelo Chrome ou instale o app.
      </p>
    )
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full',
            estado === 'ativo' ? 'bg-ok/15 text-ok' : 'bg-muted text-muted-foreground',
          )}
        >
          {estado === 'ativo' ? <BellRing className="size-5" /> : <BellOff className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {estado === 'ativo' ? 'Ligados neste aparelho' : 'Desligados neste aparelho'}
          </p>
          {estado === 'bloqueado' && (
            <p className="text-muted-foreground text-xs">
              Notificações bloqueadas. Libere nas configurações do navegador.
            </p>
          )}
        </div>
        {estado !== 'bloqueado' && (
          <Button
            size="sm"
            variant={estado === 'ativo' ? 'secondary' : 'default'}
            onClick={alternar}
            disabled={ocupado}
          >
            {ocupado && <Loader2 className="animate-spin" />}
            {estado === 'ativo' ? 'Desligar' : 'Ligar'}
          </Button>
        )}
      </div>

      <div className="grid gap-1 border-t pt-3">
        {TIPOS.map((t) => (
          <label key={t.chave} className="flex items-center gap-3 py-1.5">
            <input
              type="checkbox"
              className="accent-primary size-5"
              checked={config.notificacoes[t.chave]}
              onChange={(e) => mudarTipo(t.chave, e.target.checked)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{t.rotulo}</span>
              <span className="text-muted-foreground block text-xs">{t.dica}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

/** Montado no layout: com o app aberto, a notificação vira um toast. */
export function LembretesEmPrimeiroPlano() {
  useEffect(() => {
    let parar = () => {}
    ouvirEmPrimeiroPlano((titulo, corpo) => toast(titulo, { description: corpo })).then(
      (p) => (parar = p),
    )
    return () => parar()
  }, [])
  return null
}
