import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CriarCadernoForm } from '@/components/cadernos/criar-caderno-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Novo Caderno | KAV Concursos',
  description: 'Crie um novo caderno de estudo personalizado',
}

export default async function NovoCadernoDentroPastaPage({
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

  const pastaId = parseInt(params.id, 10)

  if (isNaN(pastaId)) {
    redirect('/dashboard/cadernos')
  }

  // Verificar se a pasta existe e pertence ao usuário
  const { data: pasta, error: pastaError } = await supabase
    .from('pastas_cadernos')
    .select('*')
    .eq('id', pastaId)
    .eq('user_id', user.id)
    .single()

  if (pastaError || !pasta) {
    redirect('/dashboard/cadernos')
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/dashboard/cadernos/pastas/${pastaId}`}
            className="inline-flex items-center text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para {pasta.nome}
          </Link>
        </div>

        <CriarCadernoForm
          disciplinas={disciplinas || []}
          bancas={bancas || []}
          orgaos={orgaos || []}
          areasCarreira={areasCarreira || []}
          formacoes={formacoes || []}
          assuntos={assuntos || []}
          plano={plano}
          pastaId={pastaId}
          pastaNome={pasta.nome}
        />
      </div>
    </div>
  )
}
