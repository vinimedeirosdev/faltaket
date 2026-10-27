import { DropdownMenu } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Menu = DropdownMenu.Root
export const MenuTrigger = DropdownMenu.Trigger

export function MenuContent({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'bg-popover text-popover-foreground z-50 min-w-44 overflow-hidden rounded-xl border p-1 shadow-lg',
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  )
}

export function MenuItem({
  className,
  destrutivo,
  ...props
}: ComponentProps<typeof DropdownMenu.Item> & { destrutivo?: boolean }) {
  return (
    <DropdownMenu.Item
      className={cn(
        'data-[highlighted]:bg-muted flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm outline-none select-none [&_svg]:size-4',
        destrutivo && 'text-destructive',
        className,
      )}
      {...props}
    />
  )
}

export function MenuSeparator(props: ComponentProps<typeof DropdownMenu.Separator>) {
  return <DropdownMenu.Separator className="bg-border -mx-1 my-1 h-px" {...props} />
}
