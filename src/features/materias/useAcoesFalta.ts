import { toast } from 'sonner'
import { vibrate } from '@/lib/utils'
import { useUsuario } from '../auth/AuthProvider'
import { adicionarFalta, novaFalta, removerFalta } from './api'
import { LIMITES, type Falta, type Materia } from './model'

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar. Tente de novo.')
}

/** Registrar/remover falta com update otimista e "Desfazer" no toast. */
export function useAcoesFalta() {
  const { uid } = useUsuario()

  function registrar(materia: Materia, opts?: { data?: Date; obs?: string }) {
    if (materia.faltas.length >= LIMITES.faltasRegistradas) {
      toast.error('Limite de faltas registradas atingido.')
      return
    }
    const falta = novaFalta(opts)
    vibrate()
    adicionarFalta(uid, materia.id, falta).catch(avisarErro)
    toast.success(`Falta registrada em ${materia.nome}`, {
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

  return { registrar, remover, removerUltima }
}
