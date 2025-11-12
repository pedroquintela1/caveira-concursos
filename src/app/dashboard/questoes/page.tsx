import { redirect } from 'next/navigation'

export default function QuestoesPage() {
  // Redirecionar para Cadernos (v2.1 - questões avulsas removidas)
  redirect('/dashboard/cadernos')
}
