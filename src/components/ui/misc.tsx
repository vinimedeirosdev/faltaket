import type { ComponentProps, ReactNode } from 'react'
import { cn, iniciais } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('bg-muted animate-pulse rounded-xl', className)} {...props} />
}

export function Avatar({
  nome,
  foto,
  className,
}: {
  nome: string
  foto?: string
  className?: string
}) {
  if (foto) {
    return (
      <img
        src={foto}
        alt=""
        className={cn('size-10 shrink-0 rounded-full object-cover shadow-sm', className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-pink-400 text-sm font-bold text-white shadow-sm',
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-hand bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-4xl leading-none font-bold text-transparent',
        className,
      )}
    >
      FaltaKet
    </span>
  )
}

export function EmptyState({
  icone,
  titulo,
  descricao,
  children,
}: {
  icone: ReactNode
  titulo: string
  descricao?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-12 text-center">
      <div className="bg-secondary text-primary grid size-16 place-items-center rounded-2xl text-3xl [&_svg]:size-8">
        {icone}
      </div>
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {descricao && <p className="text-muted-foreground max-w-xs text-sm">{descricao}</p>}
      {children}
    </div>
  )
}
