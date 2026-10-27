import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { STATUS_CLASSES, type Status } from './model'

export function ProgressRing({
  status,
  max,
  size = 64,
}: {
  status: Status
  max: number
  size?: number
}) {
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.min(status.progresso, 1)

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${status.usadas} de ${max} faltas`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={cn(STATUS_CLASSES[status.tipo].stroke, 'transition-[stroke]')}
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums">
        <motion.span
          key={status.usadas}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {status.usadas}
        </motion.span>
        <span className="text-muted-foreground font-medium">/{max}</span>
      </span>
    </div>
  )
}
