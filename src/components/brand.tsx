import icone from '@/assets/brand/icone.webp'
import logo from '@/assets/brand/logo.webp'
import { cn } from '@/lib/utils'

// Imagens com fundo transparente, geradas a partir de branding/logo-original.png (npm run marca).

/** Logo completa (ilustração + nome). Telas de entrada e splash. */
export function LogoCompleta({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="FaltaKet"
      width={720}
      height={720}
      // fundo transparente; no tema escuro um brilho claro mantém o texto magenta legível
      className={cn(
        'h-auto w-56 drop-shadow-[0_8px_24px_rgb(236_72_153/0.18)] select-none dark:drop-shadow-[0_0_14px_rgb(255_255_255/0.28)]',
        className,
      )}
      draggable={false}
    />
  )
}

/** Só a ilustração, para espaços pequenos (topo do app). */
export function MarcaIcone({ className }: { className?: string }) {
  return (
    <img
      src={icone}
      alt=""
      width={160}
      height={160}
      className={cn('size-10 object-contain select-none', className)}
      draggable={false}
    />
  )
}
