import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import {
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { env } from '@/lib/env'
import { auth, db } from '@/lib/firebase'
import { normalizeUsername, usernameToEmail } from '@/lib/username'
import { excluirTodosEventos } from '../agenda/api'
import { excluirTodasMaterias } from '../materias/api'
import { excluirTodosDispositivos } from '../notificacoes/push'

export interface Perfil {
  name: string
  username: string
  /** data URL (WebP/JPEG 256×256), gerada por prepararFotoPerfil */
  foto?: string
  config?: Config
  features?: { termo?: boolean }
}

/** Preferências da faculdade e dos lembretes (todas opcionais; ver CONFIG_PADRAO). */
export interface Config {
  mediaAprovacao?: number
  /** abaixo da média mas >= este valor = exame/recuperação; ausente = não tem exame */
  mediaExame?: number
  /** datas do semestre "AAAA-MM-DD" (usadas ao exportar a agenda) */
  semestreInicio?: string
  semestreFim?: string
  notificacoes?: { aulas?: boolean; provas?: boolean; entregas?: boolean; risco?: boolean }
}

export const CONFIG_PADRAO = {
  mediaAprovacao: 7,
  notificacoes: { aulas: true, provas: true, entregas: true, risco: true },
} as const

const toEmail = (username: string) => usernameToEmail(username, env.VITE_AUTH_EMAIL_DOMAIN)
const perfilRef = (uid: string) => doc(db, 'users', uid)

export async function entrar(username: string, senha: string) {
  await signInWithEmailAndPassword(auth, toEmail(username), senha)
}

export async function cadastrar(nome: string, username: string, senha: string) {
  const { user } = await createUserWithEmailAndPassword(auth, toEmail(username), senha)
  await updateProfile(user, { displayName: nome })
  await setDoc(perfilRef(user.uid), {
    name: nome,
    username: normalizeUsername(username),
    createdAt: serverTimestamp(),
  })
}

export function sair() {
  return signOut(auth)
}

export function observarPerfil(
  uid: string,
  onData: (perfil: Perfil | null) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(perfilRef(uid), (snap) => onData((snap.data() as Perfil) ?? null), onError)
}

export async function atualizarNome(nome: string) {
  const user = requireUser()
  await Promise.all([
    updateProfile(user, { displayName: nome }),
    updateDoc(perfilRef(user.uid), { name: nome }),
  ])
}

/** Salva (ou remove, com null) a foto. Não aguarde: offline só resolve quando sincronizar. */
export function atualizarFoto(foto: string | null) {
  const user = requireUser()
  return updateDoc(perfilRef(user.uid), { foto: foto ?? deleteField() })
}

/**
 * Atualiza campos da config sem apagar os outros ("config.x" no Firestore).
 * null remove o campo. Não aguarde: offline só resolve quando sincronizar.
 */
export function atualizarConfig(campos: { [K in keyof Config]?: Config[K] | null }) {
  const user = requireUser()
  const dados = Object.fromEntries(
    Object.entries(campos).map(([k, v]) => ['config.' + k, v ?? deleteField()]),
  )
  return updateDoc(perfilRef(user.uid), dados)
}

async function reautenticar(senhaAtual: string) {
  const user = requireUser()
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, senhaAtual))
  return user
}

export async function trocarSenha(senhaAtual: string, novaSenha: string) {
  const user = await reautenticar(senhaAtual)
  await updatePassword(user, novaSenha)
}

export async function excluirConta(senhaAtual: string) {
  const user = await reautenticar(senhaAtual)
  await excluirTodasMaterias(user.uid)
  await excluirTodosEventos(user.uid)
  await excluirTodosDispositivos(user.uid)
  await deleteDoc(perfilRef(user.uid))
  await deleteUser(user)
}

function requireUser() {
  if (!auth.currentUser) throw new Error('Sessão expirada. Entre novamente.')
  return auth.currentUser
}

/** Traduz erros do Firebase para mensagens amigáveis. */
export function mensagemDeErro(e: unknown): string {
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'Usuário ou senha incorretos.'
      case 'auth/email-already-in-use':
        return 'Esse nome de usuário já está em uso.'
      case 'auth/weak-password':
        return 'A senha precisa ter pelo menos 6 caracteres.'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Espere um pouquinho e tente de novo.'
      case 'auth/network-request-failed':
        return 'Sem conexão com a internet.'
      case 'auth/requires-recent-login':
        return 'Por segurança, entre novamente e repita a operação.'
      case 'permission-denied':
        return 'Você não tem permissão para fazer isso.'
    }
  }
  if (e instanceof Error && e.message) return e.message
  return 'Algo deu errado. Tente novamente.'
}
