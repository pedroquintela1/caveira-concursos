import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditarCadernoForm } from '@/components/cadernos/editar-caderno-form'

export const metadata = {
  title: 'Editar Caderno | KAV Concursos',
  description: 'Edite seu caderno de estudo',
}

export default async function EditarCadernoPage({
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

  const cadernoId = parseInt(params.id, 10)

  // Buscar caderno
  const { data: caderno, error: cadernoError } = await supabase
    .from('cadernos')
    .select('*')
    .eq('id', cadernoId)
    .eq('user_id', user.id)
    .single()

  if (cadernoError || !caderno) {
    redirect('/dashboard/cadernos')
  }

  // Buscar dados para o formulário
  const [{ data: disciplinas }, { data: bancas }, { data: orgaos }, { data: profile }] =
    await Promise.all([
      supabase.from('disciplinas').select('*').order('ordem', { ascending: true }),
      supabase.from('bancas').select('*').order('nome', { ascending: true }),
      supabase.from('orgaos').select('*').order('nome', { ascending: true }),
      supabase.from('profiles').select('plano').eq('id', user.id).single(),
    ])

  const plano = profile?.plano || 'free'

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <EditarCadernoForm
          caderno={caderno}
          disciplinas={disciplinas || []}
          bancas={bancas || []}
          orgaos={orgaos || []}
          plano={plano}
        />
      </div>
    </div>
  )
}
