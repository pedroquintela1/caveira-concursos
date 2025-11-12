import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CriarCadernoForm } from '@/components/cadernos/criar-caderno-form'

export const metadata = {
  title: 'Novo Caderno | KAV Concursos',
  description: 'Crie um novo caderno de estudo personalizado',
}

export default async function NovoCadernoPage() {
  const supabase = createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar dados para o formulário
  const [
    { data: disciplinas },
    { data: bancas },
    { data: orgaos },
    { data: areasCarreira },
    { data: formacoes },
    { data: assuntos },
    { data: profile },
  ] = await Promise.all([
    supabase.from('disciplinas').select('*').order('ordem', { ascending: true }),
    supabase.from('bancas').select('*').order('nome', { ascending: true }),
    supabase.from('orgaos').select('*').order('nome', { ascending: true }),
    supabase.from('areas_carreira').select('*').order('ordem', { ascending: true }),
    supabase.from('formacoes').select('*').order('ordem', { ascending: true }),
    supabase
      .from('assuntos')
      .select('*, disciplina:disciplinas(nome)')
      .order('ordem', { ascending: true }),
    supabase.from('profiles').select('plano').eq('id', user.id).single(),
  ])

  const plano = profile?.plano || 'free'

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-5xl">
        <CriarCadernoForm
          disciplinas={disciplinas || []}
          bancas={bancas || []}
          orgaos={orgaos || []}
          areasCarreira={areasCarreira || []}
          formacoes={formacoes || []}
          assuntos={assuntos || []}
          plano={plano}
        />
      </div>
    </div>
  )
}
