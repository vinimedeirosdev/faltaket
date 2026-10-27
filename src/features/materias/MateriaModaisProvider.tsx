import { createContext, useContext, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Confirm } from '@/components/ui/confirm'
import { Modal } from '@/components/ui/modal'
import { useUsuario } from '../auth/AuthProvider'
import { criarMateria, editarMateria, excluirMateria } from './api'
import { Historico } from './Historico'
import { MateriaForm } from './MateriaForm'
import { useMaterias } from './MateriasProvider'
import { CORES, diaSemanaDe, type Materia, type MateriaInput } from './model'

type Aberto =
  | { tipo: 'nova' }
  | { tipo: 'editar'; id: string }
  | { tipo: 'historico'; id: string }
  | { tipo: 'excluir'; id: string }
  | null

interface Acoes {
  nova: () => void
  editar: (m: Materia) => void
  historico: (m: Materia) => void
  excluir: (m: Materia) => void
}

const Ctx = createContext<Acoes | null>(null)

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

/** Concentra os modais de matéria para qualquer tela (ou o FAB) poder abri-los. */
export function MateriaModaisProvider({ children }: { children: ReactNode }) {
  const { uid } = useUsuario()
  const { materias } = useMaterias()
  const [aberto, setAberto] = useState<Aberto>(null)
  // a matéria é buscada na lista "ao vivo", então o histórico atualiza na hora
  const materia = aberto && 'id' in aberto ? materias.find((m) => m.id === aberto.id) : undefined
  const fechar = () => setAberto(null)

  const acoes: Acoes = {
    nova: () => setAberto({ tipo: 'nova' }),
    editar: (m) => setAberto({ tipo: 'editar', id: m.id }),
    historico: (m) => setAberto({ tipo: 'historico', id: m.id }),
    excluir: (m) => setAberto({ tipo: 'excluir', id: m.id }),
  }

  function salvarNova(dados: MateriaInput) {
    criarMateria(uid, dados).catch(avisarErro)
    toast.success('Matéria adicionada!')
    fechar()
  }

  function salvarEdicao(dados: MateriaInput) {
    if (!materia) return
    editarMateria(uid, materia.id, dados).catch(avisarErro)
    toast.success('Matéria atualizada!')
    fechar()
  }

  function confirmarExclusao() {
    if (!materia) return
    excluirMateria(uid, materia.id).catch(avisarErro)
    toast(`${materia.nome} excluída`)
    fechar()
  }

  const novaPadrao: MateriaInput = {
    nome: '',
    diaSemana: diaSemanaDe(new Date()),
    maxFaltas: 5,
    cor: CORES[materias.length % CORES.length],
  }

  return (
    <Ctx value={acoes}>
      {children}

      <Modal
        open={aberto?.tipo === 'nova'}
        onOpenChange={(o) => !o && fechar()}
        titulo="Nova matéria"
      >
        <MateriaForm inicial={novaPadrao} onSubmit={salvarNova} textoBotao="Adicionar matéria" />
      </Modal>

      <Modal
        open={aberto?.tipo === 'editar' && !!materia}
        onOpenChange={(o) => !o && fechar()}
        titulo="Editar matéria"
      >
        {materia && (
          <MateriaForm
            key={materia.id}
            inicial={{
              nome: materia.nome,
              diaSemana: materia.diaSemana,
              maxFaltas: materia.maxFaltas,
              cor: materia.cor,
            }}
            onSubmit={salvarEdicao}
            textoBotao="Salvar alterações"
          />
        )}
      </Modal>

      <Modal
        open={aberto?.tipo === 'historico' && !!materia}
        onOpenChange={(o) => !o && fechar()}
        titulo={materia ? materia.nome : 'Histórico'}
        descricao="Histórico de faltas"
      >
        {materia && <Historico materia={materia} />}
      </Modal>

      <Confirm
        open={aberto?.tipo === 'excluir' && !!materia}
        onOpenChange={(o) => !o && fechar()}
        titulo={`Excluir ${materia?.nome ?? 'matéria'}?`}
        descricao="A matéria e todo o histórico de faltas serão apagados. Não dá para desfazer."
        confirmar="Excluir"
        onConfirm={confirmarExclusao}
      />
    </Ctx>
  )
}

export function useMateriaModais() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMateriaModais precisa estar dentro de <MateriaModaisProvider>')
  return ctx
}
