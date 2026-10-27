// ATENÇÃO: precisa ser idêntico a faltaket-server/scripts/lib/username.ts,
// senão os usuários migrados não conseguem entrar.

export function normalizeUsername(u: string) {
  return u.trim().toLowerCase()
}

/** Converte o nome de usuário no e-mail "sintético" usado pelo Firebase Auth. */
export function usernameToEmail(u: string, domain: string) {
  const local = Array.from(normalizeUsername(u))
    .map((c) => (/[a-z0-9._-]/.test(c) ? c : `+${c.codePointAt(0)!.toString(16)}`))
    .join('')
  return `${local}@${domain}`
}
