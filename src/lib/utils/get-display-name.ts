/**
 * Extrai o nome de exibição do usuário com prioridade:
 * 1. nome_exibicao (personalizado pelo usuário)
 * 2. Primeiro nome do nome_completo
 * 3. Primeira parte do email
 * 4. "Estudante" (fallback)
 */
export function getDisplayName(profile: {
  nome_exibicao?: string | null
  nome_completo?: string | null
  email?: string
}): string {
  // 1. Se tem nome de exibição personalizado, usa
  if (profile.nome_exibicao?.trim()) {
    return profile.nome_exibicao.trim()
  }

  // 2. Se tem nome completo, pega primeiro nome
  if (profile.nome_completo?.trim()) {
    const firstName = profile.nome_completo.trim().split(/\s+/)[0]
    return firstName
  }

  // 3. Se tem email, pega parte antes do @
  if (profile.email) {
    const emailName = profile.email.split('@')[0]
    // Capitaliza primeira letra
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  // 4. Fallback
  return 'Estudante'
}

/**
 * Extrai apenas o primeiro nome de um nome completo
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return 'Estudante'
  return fullName.trim().split(/\s+/)[0]
}
