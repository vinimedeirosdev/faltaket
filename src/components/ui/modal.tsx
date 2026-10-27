import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import { useMediaQuery } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descricao?: string
  children: ReactNode
  className?: string
}

/**
 * Modal responsivo: bottom sheet (arrastável) no celular e diálogo central
 * no desktop.
 */
export function Modal({ open, onOpenChange, titulo, descricao, children, className }: ModalProps) {
  const desktop = useMediaQuery('(min-width: 640px)')

  if (desktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
          <Dialog.Content
            className={cn(
              'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-2xl border p-6 shadow-xl',
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <Dialog.Title className="text-lg font-semibold">{titulo}</Dialog.Title>
                <Dialog.Description
                  className={cn('text-muted-foreground text-sm', !descricao && 'sr-only')}
                >
                  {descricao ?? titulo}
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="text-muted-foreground hover:bg-muted -m-2 grid size-9 place-items-center rounded-lg"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            'bg-popover text-popover-foreground pb-safe fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border-t outline-none',
            className,
          )}
        >
          <div className="bg-muted-foreground/30 mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full" />
          <div className="grid gap-1 px-5 pt-4 pb-2">
            <Drawer.Title className="text-lg font-semibold">{titulo}</Drawer.Title>
            <Drawer.Description
              className={cn('text-muted-foreground text-sm', !descricao && 'sr-only')}
            >
              {descricao ?? titulo}
            </Drawer.Description>
          </div>
          <div className="overflow-y-auto px-5 pt-2 pb-4">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
