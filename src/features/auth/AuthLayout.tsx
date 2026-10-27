import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { LogoCompleta } from '@/components/brand'

export function AuthLayout({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string
  subtitulo: string
  children: ReactNode
}) {
  return (
    <div className="pt-safe pb-safe relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-80 rounded-full bg-violet-400/35 blur-3xl dark:bg-violet-600/25" />
        <div className="absolute -right-24 -bottom-32 size-80 rounded-full bg-pink-300/40 blur-3xl dark:bg-pink-500/15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 20 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <LogoCompleta className="w-44 sm:w-52" />
          <div>
            <h1 className="text-xl font-semibold">{titulo}</h1>
            <p className="text-muted-foreground text-sm">{subtitulo}</p>
          </div>
        </div>

        <div className="bg-card/80 rounded-3xl border p-6 shadow-xl shadow-violet-500/5 backdrop-blur">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
