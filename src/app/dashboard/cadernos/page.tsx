import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, AlertCircle, FolderPlus, Folder as FolderIcon } from 'lucide-react'
import { CadernosListClient } from '@/components/cadernos/cadernos-list-client'
import { PastaCard } from '@/components/cadernos/pasta-card'

export const metadata = {
  title: 'Meus Cadernos | KAV Concursos',
  description: 'Gerencie seus cadernos de estudo personalizados',
}

export default async function CadernosPage() {
  const supabase = createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar pastas do usuário
  const { data: pastas, error: pastasError } = await supabase
    .from('pastas_cadernos')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null) // Apenas pastas raiz
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  // Para cada pasta, contar cadernos
  const pastasComContagem = await Promise.all(
    (pastas || []).map(async (pasta) => {
      const { count } = await supabase
        .from('cadernos')
        .select('*', { count: 'exact', head: true })
        .eq('pasta_id', pasta.id)
        .eq('user_id', user.id)

      return {
        ...pasta,
        total_cadernos: count || 0,
      }
    })
  )

  // Buscar cadernos do usuário SEM pasta (pasta_id null)
  const { data: cadernosSemPasta, error: cadernosError } = await supabase
    .from('cadernos')
    .select('*')
    .eq('user_id', user.id)
    .is('pasta_id', null)
    .order('created_at', { ascending: false })

  // Log detalhado do erro se houver
  if (cadernosError) {
    console.error('Erro ao buscar cadernos:', {
      message: cadernosError.message,
      details: cadernosError.details,
      hint: cadernosError.hint,
      code: cadernosError.code
    })
  }

  if (pastasError) {
    console.error('Erro ao buscar pastas:', pastasError)
  }

  // Buscar informações do plano
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single()

  const plano = profile?.plano || 'free'

  // Limites por plano
  const LIMITES = {
    free: { max_cadernos: 2, max_questoes: 50, max_pastas: 0 },
    basic: { max_cadernos: 10, max_questoes: 200, max_pastas: 5 },
    premium: { max_cadernos: 999999, max_questoes: 500, max_pastas: 999999 },
  }

  const limite = LIMITES[plano as keyof typeof LIMITES] || LIMITES.free

  // Contar cadernos ativos (incluindo todos, com ou sem pasta)
  const { count: totalCadernosAtivos } = await supabase
    .from('cadernos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_concluido', false)

  const cadernosAtivos = totalCadernosAtivos || 0
  const podeCrearMais = cadernosAtivos < limite.max_cadernos
  const podeCrearPasta = (pastas?.length || 0) < limite.max_pastas

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Meus Cadernos</h1>
            <p className="text-gray-400 mt-2">
              Organize seus estudos com cadernos personalizados
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/cadernos/pastas/nova">
              <Button
                className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
                disabled={!podeCrearPasta}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Pasta
              </Button>
            </Link>
          </div>
        </div>

        {/* Status do Plano */}
        <div className="mt-4 flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <BookOpen className="w-5 h-5 text-[#8fbc8f]" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Plano: <span className="font-semibold text-white uppercase">{plano}</span>
              </span>
              <span className="text-sm text-gray-400">
                {cadernosAtivos} / {limite.max_cadernos === 999999 ? '∞' : limite.max_cadernos}{' '}
                cadernos ativos
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8fbc8f]"
                style={{
                  width: `${Math.min(
                    (cadernosAtivos / limite.max_cadernos) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Aviso de Limite Atingido */}
        {!podeCrearMais && (
          <div className="mt-4 p-4 bg-orange-900/20 border border-orange-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-500">
                Limite de cadernos atingido
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Você atingiu o limite de {limite.max_cadernos} caderno(s) ativo(s) do plano{' '}
                {plano.toUpperCase()}. Desative um caderno existente ou faça upgrade para criar
                mais.
              </p>
              {plano !== 'premium' && (
                <Link href="/dashboard/assinatura">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-orange-600 text-orange-500 hover:bg-orange-900/30"
                  >
                    Fazer Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Seção de Cadernos Sem Pasta */}
      {cadernosSemPasta && cadernosSemPasta.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8fbc8f]" />
              Meus Cadernos ({cadernosSemPasta.length})
            </h2>
            <Link href="/dashboard/cadernos/novo">
              <Button
                className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
                disabled={!podeCrearMais}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Caderno
              </Button>
            </Link>
          </div>
          <CadernosListClient cadernos={cadernosSemPasta} plano={plano} />
        </div>
      )}

      {/* Seção de Pastas */}
      {pastasComContagem.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderIcon className="w-6 h-6 text-[#8fbc8f]" />
              Minhas Pastas ({pastasComContagem.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pastasComContagem.map((pasta) => (
              <PastaCard
                key={pasta.id}
                pasta={pasta}
                totalCadernos={pasta.total_cadernos}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio - Só mostra se não houver NADA */}
      {pastasComContagem.length === 0 && (!cadernosSemPasta || cadernosSemPasta.length === 0) && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum caderno criado ainda
          </h3>
          <p className="text-gray-400 mb-6">
            Crie seu primeiro caderno personalizado para começar a estudar Lei Seca
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/cadernos/novo">
              <Button
                className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
                disabled={!podeCrearMais}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Caderno
              </Button>
            </Link>
            {podeCrearPasta && (
              <Link href="/dashboard/cadernos/pastas/nova">
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Criar Pasta
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
