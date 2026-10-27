import { Eye, EyeOff } from 'lucide-react'
import { Label as LabelPrimitive } from 'radix-ui'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full min-w-0 rounded-xl border border-input bg-card px-4 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldBase, 'h-12', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldBase, 'min-h-20 resize-none py-3', className)} {...props} />
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="relative">
      <Input type={visivel ? 'text' : 'password'} className={cn('pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-12 place-items-center"
      >
        {visivel ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm leading-none font-medium select-none', className)}
      {...props}
    />
  )
}

/** Label + campo + mensagem de erro, já ligados por id/aria. */
export function Field({
  id,
  label,
  erro,
  dica,
  children,
}: {
  id: string
  label: string
  erro?: string
  dica?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-destructive text-sm">
          {erro}
        </p>
      ) : (
        dica && <p className="text-muted-foreground text-xs">{dica}</p>
      )}
    </div>
  )
}
