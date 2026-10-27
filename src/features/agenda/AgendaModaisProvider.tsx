import { createContext, useContext, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Confirm } from '@/components/ui/confirm'
import { Modal } from '@/components/ui/modal'
import { uid as novoId } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { salvarNotas } from '../materias/api'
import { useMaterias } from '../materias/MateriasProvider'
import { LIMITES } from '../materias/model'
import { criarEvento, editarEvento, excluirEvento } from './api'
import { EventoForm } from './EventoForm'
import { useEventos } from './EventosProvider'
import { TIPO_INFO, type Evento, type EventoInput, type TipoEvento } from './model'

type Aberto =
  | { tipo: 'novo'; materiaId?: string; tipoEvento?: TipoEvento }
  | { tipo: 'editar'; id: string }
  | { tipo: 'excluir'; id: string }
  | null

interface Acoes {
  novo: (opts?: { materiaId?: string; tipo?: TipoEvento }) => void
  editar: (e: Evento) => void
}

const Ctx = createContext<Acoes | null>(null)

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

export function AgendaModaisProvider({ children }: { children: ReactNode }) {
  const { uid } = useUsuario()
  const { eventos } = useEventos()
  const { materias } = useMaterias()
  const [aberto, setAberto] = useState<Aberto>(null)
  const evento = aberto && 'id' in aberto ? eventos.find((e) => e.id === aberto.id) : undefined
  const fechar = () => setAberto(null)

  const acoes: Acoes = {
    novo: (opts) => setAberto({ tipo: 'novo', materiaId: opts?.materiaId, tipoEvento: opts?.tipo }),
    editar: (e) => setAberto({ tipo: 'editar', id: e.id }),
  }

  function salvarNovo(dados: EventoInput, { criarNota }: { criarNota: boolean }) {
    criarEvento(uid, dados).catch(avisarErro)
    // "criar esta avaliação nas Notas": nota pendente (sem valor), peso 1
    const materia = criarNota ? materias.find((m) => m.id === dados.materiaId) : undefined
    if (materia && (materia.notas?.length ?? 0) < LIMITES.notas) {
      const nota = {
        id: novoId(),
        nome: dados.titulo.trim().slice(0, LIMITES.notaNome),
        peso: 1,
        valor: null,
      }
      salvarNotas(uid, materia.id, [...(materia.notas ?? []), nota]).catch(avisarErro)
    }
    toast.success(`${TIPO_INFO[dados.tipo].nome} adicionada à agenda`)
    fechar()
  }

  function salvarEdicao(dados: EventoInput) {
    if (!evento) return
    editarEvento(uid, evento.id, dados).catch(avisarErro)
    toast.success('Atualizado!')
    fechar()
  }

  function confirmarExclusao() {
    if (!evento) return
    excluirEvento(uid, evento.id).catch(avisarErro)
    toast(`"${evento.titulo}" excluído`)
    fechar()
  }

  return (
    <Ctx value={acoes}>
      {children}

      <Modal
        open={aberto?.tipo === 'novo'}
        onOpenChange={(o) => !o && fechar()}
        titulo="Nova prova ou entrega"
      >
        {aberto?.tipo === 'novo' && (
          <EventoForm
            novo
            inicial={{ materiaId: aberto.materiaId ?? null, tipo: aberto.tipoEvento }}
            onSubmit={salvarNovo}
          />
        )}
      </Modal>

      <Modal
        open={aberto?.tipo === 'editar' && !!evento}
        onOpenChange={(o) => !o && fechar()}
        titulo={evento ? TIPO_INFO[evento.tipo].nome : 'Editar'}
      >
        {evento && (
          <EventoForm
            key={evento.id}
            novo={false}
            inicial={{
              tipo: evento.tipo,
              titulo: evento.titulo,
              materiaId: evento.materiaId ?? null,
              data: evento.data.toDate(),
              temHora: evento.temHora,
              local: evento.local ?? '',
              descricao: evento.descricao ?? '',
              checklist: evento.checklist,
            }}
            onSubmit={salvarEdicao}
            onExcluir={() => setAberto({ tipo: 'excluir', id: evento.id })}
          />
        )}
      </Modal>

      <Confirm
        open={aberto?.tipo === 'excluir' && !!evento}
        onOpenChange={(o) => !o && fechar()}
        titulo={`Excluir "${evento?.titulo ?? ''}"?`}
        descricao="Não dá para desfazer."
        confirmar="Excluir"
        onConfirm={confirmarExclusao}
      />
    </Ctx>
  )
}

export function useAgendaModais() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAgendaModais precisa estar dentro de <AgendaModaisProvider>')
  return ctx
}
