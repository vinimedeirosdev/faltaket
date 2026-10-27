/// <reference lib="webworker" />
// Service worker do FaltaKet (vite-plugin-pwa, estratégia injectManifest).
// 1. Cache offline do app (Workbox).
// 2. Lembretes: recebe as notificações do Firebase Cloud Messaging com o app fechado.

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

// ── offline ──────────────────────────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
// qualquer rota do app (ex.: /materias/abc) abre o index.html do cache
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

// o app mostra "Nova versão disponível · Atualizar"; o clique manda esta mensagem
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ── lembretes (só se a chave VAPID estiver configurada) ─────────────────
const env = import.meta.env
if (env.VITE_FIREBASE_VAPID_KEY) {
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  })
  // As mensagens chegam com "notification" + "webpush.fcmOptions.link": o SDK
  // mostra a notificação e abre o link no clique sozinho. Nada extra a fazer aqui.
  onBackgroundMessage(getMessaging(app), () => {})
}
