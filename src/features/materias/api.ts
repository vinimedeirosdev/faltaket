import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uid } from '@/lib/utils'
import type { Falta, Materia, MateriaInput } from './model'

// Todas as escritas usam o cache local do Firestore: a tela atualiza na hora
// (onSnapshot dispara com a mudança local) e o envio ao servidor acontece em
// segundo plano. Por isso, NÃO aguarde essas promises na UI: offline elas só
// resolvem quando a conexão voltar. Use apenas .catch para avisar erros.

const materiasRef = (userId: string) => collection(db, 'users', userId, 'materias')
const materiaRef = (userId: string, materiaId: string) =>
  doc(db, 'users', userId, 'materias', materiaId)

export function observarMaterias(
  userId: string,
  onData: (materias: Materia[]) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(
    materiasRef(userId),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Materia)),
    onError,
  )
}

export function criarMateria(userId: string, input: MateriaInput) {
  return addDoc(materiasRef(userId), {
    ...input,
    faltas: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/** Edita só os dados da matéria; as faltas registradas são preservadas. */
export function editarMateria(userId: string, materiaId: string, input: MateriaInput) {
  return updateDoc(materiaRef(userId, materiaId), { ...input, updatedAt: serverTimestamp() })
}

export function excluirMateria(userId: string, materiaId: string) {
  return deleteDoc(materiaRef(userId, materiaId))
}

export function novaFalta(opts: { data?: Date; obs?: string } = {}): Falta {
  const obs = opts.obs?.trim()
  // o Firestore não aceita campos undefined, então obs só entra se existir
  return {
    id: uid(),
    data: Timestamp.fromDate(opts.data ?? new Date()),
    ...(obs ? { obs } : {}),
  }
}

/** arrayUnion/arrayRemove são atômicos: não dependem do estado local estar atualizado. */
export function adicionarFalta(userId: string, materiaId: string, falta: Falta) {
  return updateDoc(materiaRef(userId, materiaId), {
    faltas: arrayUnion(falta),
    updatedAt: serverTimestamp(),
  })
}

export function removerFalta(userId: string, materiaId: string, falta: Falta) {
  return updateDoc(materiaRef(userId, materiaId), {
    faltas: arrayRemove(falta),
    updatedAt: serverTimestamp(),
  })
}

/** Remove todas as matérias do usuário (usado ao excluir a conta). */
export async function excluirTodasMaterias(userId: string) {
  const snap = await getDocs(materiasRef(userId))
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
