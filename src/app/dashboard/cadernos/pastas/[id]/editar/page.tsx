import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditarPastaForm } from '@/components/cadernos/editar-pasta-form'

export const metadata = {
  title: 'Editar Pasta | KAV Concursos',
  description: 'Editar informações da pasta',
}

export default async function EditarPastaPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar pasta
  const { data: pasta, error } = await supabase
    .from('pastas_cadernos')
    .select('*')
    .eq('id', parseInt(params.id))
    .eq('user_id', user.id)
    .single()

  if (error || !pasta) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <EditarPastaForm pasta={pasta} />
      </div>
    </div>
  )
}
