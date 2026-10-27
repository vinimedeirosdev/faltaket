import { AlertDialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { Button } from './button'

interface ConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descricao: ReactNode
  confirmar: string
  onConfirm: () => void
  children?: ReactNode
  /** desabilita o botão de confirmar (ex.: campo obrigatório vazio) */
  bloqueado?: boolean
}

export function Confirm({
  open,
  onOpenChange,
  titulo,
  descricao,
  confirmar,
  onConfirm,
  children,
  bloqueado,
}: ConfirmProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Content className="bg-popover fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">{titulo}</AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground text-sm">
            {descricao}
          </AlertDialog.Description>
          {children}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">Cancelar</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm} disabled={bloqueado}>
                {confirmar}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
