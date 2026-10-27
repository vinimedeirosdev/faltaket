import { z } from 'zod'

const schema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  // chave pública Web Push (Console > Cloud Messaging); sem ela os lembretes ficam desligados
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
  VITE_AUTH_EMAIL_DOMAIN: z.string().min(1).default('faltaket.app'),
  VITE_USE_EMULATORS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  const faltando = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
  throw new Error(
    `Variáveis de ambiente inválidas ou ausentes: ${faltando}. ` +
      'Copie .env.example para .env.local e preencha (veja docs/SETUP.md).',
  )
}

export const env = parsed.data
