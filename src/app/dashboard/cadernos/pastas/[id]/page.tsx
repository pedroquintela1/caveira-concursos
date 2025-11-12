import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Folder, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CadernosListClient } from '@/components/cadernos/cadernos-list-client'
import { DeletePastaButton } from '@/components/cadernos/delete-pasta-button'

export const metadata = {
  title: 'Pasta | KAV Concursos',
  description: 'Visualizar cadernos da pasta',
}

export default async function PastaPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // 1. Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 2. Buscar informações da pasta
  const { data: pasta, error: pastaError } = await supabase
    .from('pastas_cadernos')
    .select('*')
    .eq('id', parseInt(params.id))
    .eq('user_id', user.id)
    .single()

  if (pastaError || !pasta) {
    notFound()
  }

  // 3. Buscar informações do plano
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single()

  const plano = profile?.plano || 'free'

  // 4. Limites por plano
  const LIMITES = {
    free: { max_cadernos: 2, max_questoes: 50 },
    basic: { max_cadernos: 10, max_questoes: 200 },
    premium: { max_cadernos: 999999, max_questoes: 500 },
  }

  const limite = LIMITES[plano as keyof typeof LIMITES] || LIMITES.free

  // 5. Contar cadernos TOTAIS do usuário (para verificar limite global)
  const { count: totalCadernosAtivos } = await supabase
    .from('cadernos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_concluido', false)

  const cadernosAtivos = totalCadernosAtivos || 0
  const podeCrearMais = cadernosAtivos < limite.max_cadernos

  // 6. Buscar cadernos da pasta
  const { data: cadernos } = await supabase
    .from('cadernos')
    .select('*')
    .eq('pasta_id', parseInt(params.id))
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 7. Calcular estatísticas da pasta
  const stats = {
    total: cadernos?.length || 0,
    ativos: cadernos?.filter((c) => !c.is_concluido).length || 0,
    concluidos: cadernos?.filter((c) => c.is_concluido).length || 0,
    questoes_respondidas: cadernos?.reduce((sum, c) => sum + (c.questoes_respondidas || 0), 0) || 0,
  }

  const progressoMedio = cadernos && cadernos.length > 0
    ? Math.round(
        cadernos.reduce((sum, c) => {
          const total = c.total_questoes || 50
          const progresso = total > 0 ? (c.questoes_respondidas / total) * 100 : 0
          return sum + progresso
        }, 0) / cadernos.length
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/cadernos"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Meus Cadernos
          </Link>
        </div>

        {/* Header da Pasta */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl"
                style={{ backgroundColor: pasta.cor + '20' }}
              >
                <Folder className="h-8 w-8" style={{ color: pasta.cor }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{pasta.nome}</h1>
                {pasta.descricao && (
                  <p className="text-gray-400 mt-1">{pasta.descricao}</p>
                )}
              </div>
            </div>

            {/* Ações da Pasta */}
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/cadernos/pastas/${params.id}/editar`}>
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Pasta
                </Button>
              </Link>
              <DeletePastaButton
                pastaId={parseInt(params.id)}
                pastaNome={pasta.nome}
                totalCadernos={stats.total}
              />
            </div>
          </div>

          {/* Informativo de Limite de Cadernos */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <BookOpen className="w-5 h-5 text-[#8fbc8f]" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Plano: <span className="font-semibold text-white uppercase">{plano}</span>
                </span>
                <span className="text-sm text-gray-400">
                  {cadernosAtivos} / {limite.max_cadernos === 999999 ? '∞' : limite.max_cadernos}{' '}
                  cadernos ativos no total
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
                  {plano.toUpperCase()}. Desative ou conclua um caderno existente ou faça upgrade para criar
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

        {/* Estatísticas da Pasta */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="text-sm text-gray-400 mb-1">Cadernos nesta Pasta</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="text-sm text-gray-400 mb-1">Ativos</p>
            <p className="text-3xl font-bold text-green-500">{stats.ativos}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="text-sm text-gray-400 mb-1">Questões Respondidas</p>
            <p className="text-3xl font-bold text-white">{stats.questoes_respondidas}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="text-sm text-gray-400 mb-1">Progresso Médio</p>
            <p className="text-3xl font-bold text-[#8fbc8f]">{progressoMedio}%</p>
          </div>
        </div>

        {/* Lista de Cadernos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Cadernos ({stats.total})
            </h2>
            <Link href={`/dashboard/cadernos/pastas/${params.id}/novo-caderno`}>
              <Button
                className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
                disabled={!podeCrearMais}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Caderno
              </Button>
            </Link>
          </div>

          {stats.total === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum caderno nesta pasta
              </h3>
              <p className="text-gray-400 mb-6">
                Crie seu primeiro caderno dentro de "{pasta.nome}"
              </p>
              <Link href={`/dashboard/cadernos/pastas/${params.id}/novo-caderno`}>
                <Button
                  className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
                  disabled={!podeCrearMais}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Caderno
                </Button>
              </Link>
            </div>
          ) : (
            <CadernosListClient cadernos={cadernos || []} plano={plano} />
          )}
        </div>
      </div>
    </div>
  )
}
