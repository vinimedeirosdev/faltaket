import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu'
import { cn } from '@/lib/utils'
import { diaSemanaDe, horariosNoDia, type Materia } from './model'
import { useAcoesFalta } from './useAcoesFalta'

/** "−" (remove a última) e "Faltei hoje"; em dia de aula dupla pergunta 1 ou 2 aulas. */
export function BotoesFalta({ materia, className }: { materia: Materia; className?: string }) {
  const { registrar, removerUltima } = useAcoesFalta()
  const duplaHoje = horariosNoDia(materia, diaSemanaDe(new Date())).some((h) => h.aulas === 2)

  const faltei = (
    <Button onClick={duplaHoje ? undefined : () => registrar(materia)}>
      <Plus className="size-5" /> Faltei hoje
    </Button>
  )

  return (
    <div className={cn('grid grid-cols-[auto_1fr] gap-2', className)}>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => removerUltima(materia)}
        disabled={materia.faltas.length === 0}
        aria-label="Remover última falta"
      >
        <Minus className="size-5" />
      </Button>
      {duplaHoje ? (
        <Menu>
          <MenuTrigger asChild>{faltei}</MenuTrigger>
          <MenuContent align="end">
            <MenuItem onSelect={() => registrar(materia, { aulas: 2 })}>
              Faltei nas 2 aulas
            </MenuItem>
            <MenuItem onSelect={() => registrar(materia)}>Só em 1 aula</MenuItem>
          </MenuContent>
        </Menu>
      ) : (
        faltei
      )}
    </div>
  )
}
