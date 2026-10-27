import {
  addDoc,
  arrayRemove,
  arrayUnion,
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
import { uid } from '@/lib/utils'
import type { Falta, Horario, Materia, MateriaInput, Nota, Professor } from './model'

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

// O Firestore não aceita `undefined`: campos opcionais vazios simplesmente não são gravados.
function limparHorario(h: Horario): Horario {
  const sala = h.sala?.trim()
  return {
    dia: h.dia,
    aulas: h.aulas === 2 ? 2 : 1,
    ...(h.inicio ? { inicio: h.inicio } : {}),
    ...(h.fim ? { fim: h.fim } : {}),
    ...(sala ? { sala } : {}),
  }
}

function limparProfessor(p: Professor | null): Professor | null {
  const nome = p?.nome.trim()
  if (!nome) return null
  const email = p?.email?.trim()
  return { nome, ...(email ? { email } : {}) }
}

export function criarMateria(userId: string, input: MateriaInput) {
  const professor = limparProfessor(input.professor)
  return addDoc(materiasRef(userId), {
    nome: input.nome,
    horarios: input.horarios.map(limparHorario),
    maxFaltas: input.maxFaltas,
    cor: input.cor,
    ...(professor ? { professor } : {}),
    faltas: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Edita só os dados da matéria; faltas e notas são preservadas.
 * Matérias da v2.0 deixam de ter `diaSemana` e passam a usar `horarios`.
 */
export function editarMateria(userId: string, materiaId: string, input: MateriaInput) {
  const professor = limparProfessor(input.professor)
  return updateDoc(materiaRef(userId, materiaId), {
    nome: input.nome,
    horarios: input.horarios.map(limparHorario),
    maxFaltas: input.maxFaltas,
    cor: input.cor,
    professor: professor ?? deleteField(),
    diaSemana: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export function excluirMateria(userId: string, materiaId: string) {
  return deleteDoc(materiaRef(userId, materiaId))
}

export function novaFalta(
  opts: { data?: Date; obs?: string; aulas?: 1 | 2; justificada?: boolean } = {},
): Falta {
  const obs = opts.obs?.trim()
  return {
    id: uid(),
    data: Timestamp.fromDate(opts.data ?? new Date()),
    ...(obs ? { obs } : {}),
    ...(opts.aulas === 2 ? { aulas: 2 as const } : {}),
    ...(opts.justificada ? { justificada: true } : {}),
  }
}

/** Troca uma falta por outra versão dela (ex.: marcar como justificada). */
export function atualizarFalta(userId: string, materia: Materia, falta: Falta) {
  return updateDoc(materiaRef(userId, materia.id), {
    faltas: materia.faltas.map((f) => (f.id === falta.id ? falta : f)),
    updatedAt: serverTimestamp(),
  })
}

/** Grava a lista de notas inteira (a tela edita a lista como um todo). */
export function salvarNotas(userId: string, materiaId: string, notas: Nota[]) {
  return updateDoc(materiaRef(userId, materiaId), {
    notas: notas.map((n) => ({ id: n.id, nome: n.nome.trim(), peso: n.peso, valor: n.valor })),
    updatedAt: serverTimestamp(),
  })
}

/** Média de aprovação só desta matéria; null volta a usar a do perfil. */
export function definirMediaDaMateria(userId: string, materiaId: string, media: number | null) {
  return updateDoc(materiaRef(userId, materiaId), {
    mediaAprovacao: media ?? deleteField(),
    updatedAt: serverTimestamp(),
  })
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
