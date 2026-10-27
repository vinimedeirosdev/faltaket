import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { env } from '@/lib/env'
import { app, db } from '@/lib/firebase'

// Lembretes: o aparelho registra um token do Firebase Cloud Messaging em
// users/{uid}/dispositivos/{hash}. Um job agendado (faltaket-server/scripts/lembretes.ts)
// lê esses tokens e envia as notificações. Ver docs/LEMBRETES.md.

const CHAVE_LOCAL = 'faltaket:dispositivo'

export type EstadoLembretes = 'indisponivel' | 'sem-config' | 'bloqueado' | 'ativo' | 'inativo'

const dispositivosRef = (uid: string) => collection(db, 'users', uid, 'dispositivos')

function lerLocal() {
  try {
    return localStorage.getItem(CHAVE_LOCAL)
  } catch {
    return null
  }
}

function gravarLocal(id: string | null) {
  try {
    if (id) localStorage.setItem(CHAVE_LOCAL, id)
    else localStorage.removeItem(CHAVE_LOCAL)
  } catch {
    // navegação privada: só não lembra entre sessões
  }
}

/** iPhone só recebe notificação com o app instalado na tela de início (iOS 16.4+). */
export const ehIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
export const ehInstalado = () => window.matchMedia('(display-mode: standalone)').matches

export async function estadoLembretes(): Promise<EstadoLembretes> {
  if (!env.VITE_FIREBASE_VAPID_KEY) return 'sem-config'
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return 'indisponivel'
  if (!(await isSupported().catch(() => false))) return 'indisponivel'
  if (Notification.permission === 'denied') return 'bloqueado'
  return Notification.permission === 'granted' && lerLocal() ? 'ativo' : 'inativo'
}

function plataforma() {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'iPhone'
  if (/android/i.test(ua)) return 'Android'
  return 'Computador'
}

async function hash(texto: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40)
}

/** O service worker só existe no app publicado (npm run build/preview), não no npm run dev. */
async function registroDoServiceWorker() {
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((r) => setTimeout(() => r(null), 5000)),
  ])
  if (!reg)
    throw new Error('Os lembretes só funcionam no app publicado (não no modo de desenvolvimento).')
  return reg
}

export async function ativarLembretes(uid: string) {
  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') throw new Error('Permissão de notificação negada.')
  const token = await getToken(getMessaging(app), {
    vapidKey: env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: await registroDoServiceWorker(),
  })
  const id = await hash(token)
  await setDoc(doc(dispositivosRef(uid), id), {
    token,
    plataforma: plataforma(),
    createdAt: serverTimestamp(),
  })
  gravarLocal(id)
}

export async function desativarLembretes(uid: string) {
  const id = lerLocal()
  await deleteToken(getMessaging(app)).catch(() => {})
  if (id) await deleteDoc(doc(dispositivosRef(uid), id))
  gravarLocal(null)
}

/** Com o app aberto o navegador não mostra a notificação: vira um toast. */
export async function ouvirEmPrimeiroPlano(onNotificacao: (titulo: string, corpo: string) => void) {
  if ((await estadoLembretes()) !== 'ativo') return () => {}
  return onMessage(getMessaging(app), (m) =>
    onNotificacao(m.notification?.title ?? 'FaltaKet', m.notification?.body ?? ''),
  )
}

/** Usado ao excluir a conta. */
export async function excluirTodosDispositivos(uid: string) {
  const snap = await getDocs(dispositivosRef(uid))
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  gravarLocal(null)
}
