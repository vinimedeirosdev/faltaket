import icone from '@/assets/brand/icone.webp'
import logo from '@/assets/brand/logo.webp'
import { cn } from '@/lib/utils'

// Imagens geradas a partir de branding/logo-original.png (npm run marca).

/** Logo completa (ilustração + nome). Telas de entrada e splash. */
export function LogoCompleta({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="FaltaKet"
      width={720}
      height={720}
      // a arte tem fundo branco: o cartão arredondado deixa bonito também no tema escuro
      className={cn(
        'h-auto w-56 rounded-[2rem] bg-white shadow-xl shadow-pink-500/15 select-none',
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
      className={cn('size-10 rounded-xl bg-white object-cover shadow-sm select-none', className)}
      draggable={false}
    />
  )
}
