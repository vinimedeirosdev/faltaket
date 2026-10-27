import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Mostra um toast quando há versão nova do app; o usuário escolhe quando atualizar. */
export function AvisoAtualizacao() {
  const {
    needRefresh: [precisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: (e) => console.error('Falha ao registrar o service worker', e),
  })

  useEffect(() => {
    if (!precisaAtualizar) return
    toast('Nova versão do Faltaket disponível ✨', {
      duration: Infinity,
      action: { label: 'Atualizar', onClick: () => updateServiceWorker(true) },
    })
  }, [precisaAtualizar, updateServiceWorker])

  return null
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Botão "Instalar app": disponível no Chrome/Edge/Android. No iOS, é pelo menu Compartilhar. */
export function useInstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const instalado = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvento(e as BeforeInstallPromptEvent)
    }
    const onInstalado = () => setEvento(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalado)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalado)
    }
  }, [])

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return {
    instalado,
    podeInstalar: !!evento,
    ios,
    async instalar() {
      if (!evento) return
      await evento.prompt()
      await evento.userChoice
      setEvento(null)
    },
  }
}
