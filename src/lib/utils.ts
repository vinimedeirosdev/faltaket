import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** id curto, único o bastante para itens de lista (faltas) */
export function uid() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 20)
}

export function vibrate(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // iOS e alguns navegadores não suportam; ignorar
  }
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? ''
}

/** Data de hoje no fuso local, no formato "AAAA-MM-DD" (para <input type="date">). */
export function hojeISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}
