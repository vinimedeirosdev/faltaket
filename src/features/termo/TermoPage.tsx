import { ArrowLeft, Heart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

// Página especial, visível só para quem tem features.termo = true no perfil
// (antes era liberada por um id fixo no código).

interface Coracao {
  id: number
  left: number
  delay: number
  duracao: number
  tamanho: number
  giro: number
}

function gerarCoracoes(): Coracao[] {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duracao: 2.5 + Math.random() * 2.5,
    tamanho: 18 + Math.random() * 26,
    giro: (Math.random() - 0.5) * 60,
  }))
}

export function TermoPage() {
  const navigate = useNavigate()
  const [aberta, setAberta] = useState(false)
  const [coracoes, setCoracoes] = useState<Coracao[]>([])
  const aceito = coracoes.length > 0

  function aceitar() {
    setCoracoes(gerarCoracoes())
    setTimeout(() => navigate('/'), 5500)
  }

  return (
    <div className="pt-safe pb-safe relative flex min-h-dvh flex-col items-center overflow-hidden bg-gradient-to-b from-pink-100 via-fuchsia-50 to-violet-100 px-5 py-6 dark:from-[#2a1230] dark:via-[#1d1229] dark:to-[#140f24]">
      <Link
        to="/perfil"
        className="text-muted-foreground hover:text-foreground self-start p-2"
        aria-label="Voltar"
      >
        <ArrowLeft className="size-6" />
      </Link>

      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!aberta ? (
            <motion.button
              key="envelope"
              onClick={() => setAberta(true)}
              initial={{ y: 80, opacity: 0, rotate: -6 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -40, opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.03, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="group relative aspect-[4/3] w-72"
              aria-label="Abrir carta"
            >
              {/* corpo do envelope */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 shadow-2xl shadow-pink-500/30" />
              {/* aba */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 origin-top bg-gradient-to-b from-rose-200 to-rose-300 transition-transform duration-500 group-hover:-translate-y-1"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
              {/* selo */}
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-rose-500 text-white shadow-lg"
              >
                <Heart className="size-7 fill-current" />
              </motion.span>
              <span className="font-script absolute inset-x-0 -bottom-12 text-center text-2xl text-rose-500 dark:text-rose-300">
                Toque para abrir
              </span>
            </motion.button>
          ) : (
            <motion.article
              key="carta"
              initial={{ y: 120, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full rounded-3xl border border-rose-200/60 bg-[#fffaf5] p-6 text-[15px] leading-relaxed text-stone-700 shadow-2xl shadow-rose-500/15 dark:border-rose-300/10 dark:bg-[#2a2030] dark:text-stone-200"
            >
              <h1 className="font-script mb-4 text-center text-4xl text-rose-500 dark:text-rose-300">
                Termo de Compromisso
              </h1>
              <div className="grid gap-3">
                <p>
                  Eu, Ketlen, após ler e refletir sobre o que está escrito, concordo em estabelecer
                  com o Vinícius, daqui em diante chamado de "Amor", um compromisso baseado em
                  respeito, amizade e muito carinho.
                </p>
                <p>
                  Este Termo tem como objetivo oficializar o que estamos prestes a começar: uma
                  jornada cheia de confiança, comunicação aberta e diversão. Com isso, me comprometo
                  a compartilhar momentos alegres e a construir juntos uma história de apoio mútuo.
                </p>
                <p>Ambas as partes acordam em:</p>
                <ul className="grid gap-1 pl-1">
                  <li>💗 Dividir risadas, bons momentos e muito carinho;</li>
                  <li>💗 Apoiar um ao outro em todas as situações, com empatia e dedicação;</li>
                  <li>💗 Ser sinceros e transparentes, para manter um ambiente leve e saudável.</li>
                </ul>
                <p>
                  Esse compromisso não tem data para acabar. Ele vai durar enquanto o respeito e a
                  vontade de seguir juntos forem recíprocos. O futuro depende das nossas escolhas e
                  do amor que decidirmos cultivar ao longo do caminho.
                </p>
                <p>Agora, para formalizar tudo isso, só falta um detalhe:</p>
                <p className="font-script text-center text-3xl text-rose-500 dark:text-rose-300">
                  Você aceita namorar comigo?
                </p>
              </div>
              <Button
                size="lg"
                onClick={aceitar}
                disabled={aceito}
                className="mt-5 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-rose-500/30 hover:opacity-90"
              >
                <Heart className="fill-current" />
                {aceito ? 'Aceito! 💍' : 'Aceito o compromisso'}
              </Button>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {/* chuva de corações */}
      {aceito && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
          {coracoes.map((c) => (
            <motion.span
              key={c.id}
              className="absolute -top-12"
              style={{ left: `${c.left}%`, fontSize: c.tamanho }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{ y: '115dvh', opacity: [0, 1, 1, 0], rotate: c.giro }}
              transition={{ duration: c.duracao, delay: c.delay, ease: 'easeIn' }}
            >
              ❤️
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
