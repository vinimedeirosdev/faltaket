import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Evento, EventoInput, ItemChecklist } from './model'

// Mesmo padrão das matérias: escrita otimista, não aguarde as promises na UI.

const eventosRef = (userId: string) => collection(db, 'users', userId, 'eventos')
const eventoRef = (userId: string, id: string) => doc(db, 'users', userId, 'eventos', id)

export function observarEventos(
  userId: string,
  onData: (eventos: Evento[]) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(
    eventosRef(userId),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evento)),
    onError,
  )
}

/** Campos opcionais vazios não são gravados (o Firestore não aceita undefined). */
function dados(input: EventoInput) {
  const data = new Date(input.data)
  if (!input.temHora) data.setHours(12, 0, 0, 0)
  return {
    tipo: input.tipo,
    titulo: input.titulo.trim(),
    data: Timestamp.fromDate(data),
    temHora: input.temHora,
    checklist: input.checklist
      .filter((i) => i.texto.trim())
      .map((i) => ({ id: i.id, texto: i.texto.trim(), feito: i.feito })),
    materiaId: input.materiaId || null,
    local: input.local.trim() || null,
    descricao: input.descricao.trim() || null,
  }
}

export function criarEvento(userId: string, input: EventoInput) {
  const { materiaId, local, descricao, ...resto } = dados(input)
  return addDoc(eventosRef(userId), {
    ...resto,
    ...(materiaId ? { materiaId } : {}),
    ...(local ? { local } : {}),
    ...(descricao ? { descricao } : {}),
    concluido: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function editarEvento(userId: string, id: string, input: EventoInput) {
  const { materiaId, local, descricao, ...resto } = dados(input)
  return updateDoc(eventoRef(userId, id), {
    ...resto,
    materiaId: materiaId ?? deleteField(),
    local: local ?? deleteField(),
    descricao: descricao ?? deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export function definirConcluido(userId: string, id: string, concluido: boolean) {
  return updateDoc(eventoRef(userId, id), { concluido, updatedAt: serverTimestamp() })
}

export function salvarChecklist(userId: string, id: string, checklist: ItemChecklist[]) {
  return updateDoc(eventoRef(userId, id), { checklist, updatedAt: serverTimestamp() })
}

export function excluirEvento(userId: string, id: string) {
  return deleteDoc(eventoRef(userId, id))
}

/** Usado ao excluir a conta. */
export async function excluirTodosEventos(userId: string) {
  const snap = await getDocs(eventosRef(userId))
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
