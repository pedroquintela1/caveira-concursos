import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CriarPastaForm } from '@/components/cadernos/criar-pasta-form'

export const metadata = {
  title: 'Criar Nova Pasta | KAV Concursos',
  description: 'Crie uma nova pasta para organizar seus cadernos de estudo',
}

export default async function NovaPastaPage() {
  const supabase = createClient()

  // 1. Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 2. Buscar informações do perfil (plano)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single()

  const plano = profile?.plano || 'free'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <CriarPastaForm plano={plano} />
    </div>
  )
}
