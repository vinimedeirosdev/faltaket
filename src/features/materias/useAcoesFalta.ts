import { toast } from 'sonner'
import { vibrate } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { adicionarFalta, atualizarFalta, novaFalta, removerFalta } from './api'
import { LIMITES, type Falta, type Materia } from './model'

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

/** Registrar/remover falta com update otimista e "Desfazer" no toast. */
export function useAcoesFalta() {
  const { uid } = useUsuario()

  function registrar(materia: Materia, opts?: Parameters<typeof novaFalta>[0]) {
    if (materia.faltas.length >= LIMITES.faltasRegistradas) {
      toast.error('Limite de faltas registradas atingido.')
      return
    }
    const falta = novaFalta(opts)
    vibrate()
    adicionarFalta(uid, materia.id, falta).catch(avisarErro)
    const quantas = falta.aulas === 2 ? '2 faltas registradas' : 'Falta registrada'
    toast.success(`${quantas} em ${materia.nome}`, {
      action: {
        label: 'Desfazer',
        onClick: () => removerFalta(uid, materia.id, falta).catch(avisarErro),
      },
    })
  }

  function remover(materia: Materia, falta: Falta) {
    vibrate(8)
    removerFalta(uid, materia.id, falta).catch(avisarErro)
    toast(`Falta removida de ${materia.nome}`, {
      action: {
        label: 'Desfazer',
        onClick: () => adicionarFalta(uid, materia.id, falta).catch(avisarErro),
      },
    })
  }

  /** Remove a falta mais recente (a última adicionada fica no fim do array). */
  function removerUltima(materia: Materia) {
    const ultima = materia.faltas.at(-1)
    if (ultima) remover(materia, ultima)
  }

  /** Marca/desmarca como justificada (atestado): deixa de contar no limite. */
  function alternarJustificada(materia: Materia, falta: Falta) {
    const { justificada, ...resto } = falta
    const nova: Falta = justificada ? resto : { ...resto, justificada: true }
    atualizarFalta(uid, materia, nova).catch(avisarErro)
    toast(justificada ? 'Justificativa removida' : 'Falta justificada: não conta no limite')
  }

  return { registrar, remover, removerUltima, alternarJustificada }
}
