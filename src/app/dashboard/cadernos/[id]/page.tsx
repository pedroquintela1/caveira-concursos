import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CadernoQuestionInterface } from '@/components/cadernos/caderno-question-interface'
import { CadernoTabsWrapper } from '@/components/cadernos/caderno-tabs-wrapper'
import { CompartilharCadernoDialog } from '@/components/cadernos/compartilhar-caderno-dialog'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: 'Resolver Caderno | KAV Concursos',
  }
}

export default async function CadernoResolverPage({
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

  // Buscar informações do caderno
  const { data: caderno, error: cadernoError } = await supabase
    .from('cadernos')
    .select(
      `
      *,
      disciplinas:disciplina_id(id, nome, slug),
      bancas:banca_id(id, nome, sigla),
      orgaos:orgao_id(id, nome, sigla)
    `
    )
    .eq('id', cadernoId)
    .eq('user_id', user.id)
    .single()

  if (cadernoError || !caderno) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Caderno não encontrado</h1>
          <p className="text-gray-400 mb-6">
            O caderno que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Link href="/dashboard/cadernos">
            <Button className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold">
              Voltar para Meus Cadernos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Buscar próxima questão não respondida via RPC
  const { data: questoes } = await supabase.rpc('get_caderno_questoes', {
    p_caderno_id: cadernoId,
    p_user_id: user.id,
  })

  // Filtrar primeira questão não respondida
  const proximaQuestao = questoes?.find((q: any) => q.ja_respondida === false) || null
  const totalQuestoes = questoes?.length || 0
  const questoesRespondidas = questoes?.filter((q: any) => q.ja_respondida).length || 0
  const percentualCompleto =
    totalQuestoes > 0 ? (questoesRespondidas / totalQuestoes) * 100 : 0

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single()

  const plano = profile?.plano || 'free'

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header - Single Line */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/cadernos"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8fbc8f]" />
              <h1 className="text-base font-semibold text-white">{caderno.nome}</h1>
            </div>
            {/* Filtros compactos inline */}
            {(caderno.disciplinas || caderno.bancas) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">•</span>
                {caderno.disciplinas && (
                  <span className="text-xs text-gray-400">{caderno.disciplinas.nome}</span>
                )}
                {caderno.bancas && (
                  <span className="text-xs text-gray-400">• {caderno.bancas.sigla}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Progress compacto */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">
                <span className="font-semibold text-white">{questoesRespondidas}</span>/{totalQuestoes} questões
              </span>
              {caderno.questoes_respondidas > 0 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span
                    className={`font-semibold ${
                      caderno.taxa_acerto >= 70
                        ? 'text-green-500'
                        : caderno.taxa_acerto >= 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {caderno.taxa_acerto.toFixed(1)}% acerto
                  </span>
                </>
              )}
            </div>
            <CompartilharCadernoDialog cadernoId={cadernoId} cadernoNome={caderno.nome} />
          </div>
        </div>

        {/* Tabs: Questões, Índice, Gabarito, Estatísticas, Configurações */}
        <CadernoTabsWrapper
          cadernoId={cadernoId}
          questoesTab={
            proximaQuestao ? (
              <CadernoQuestionInterface
                questao={proximaQuestao}
                cadernoId={cadernoId}
                userId={user.id}
                plano={plano}
                indiceQuestao={questoesRespondidas + 1}
                totalQuestoes={totalQuestoes}
              />
            ) : (
              <div className="p-12 bg-gray-900 border border-gray-800 rounded-lg text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Parabéns! Caderno Concluído!
                  </h2>
                  <p className="text-gray-400 text-lg mb-4">
                    Você completou todas as {totalQuestoes} questões deste caderno!
                  </p>
                  <div className="flex items-center justify-center gap-8 py-6">
                    <div>
                      <p className="text-sm text-gray-500">Total Respondidas</p>
                      <p className="text-3xl font-bold text-white">{questoesRespondidas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taxa de Acerto</p>
                      <p
                        className={`text-3xl font-bold ${
                          caderno.taxa_acerto >= 70
                            ? 'text-green-500'
                            : caderno.taxa_acerto >= 50
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        {caderno.taxa_acerto.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/cadernos">
                  <Button className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold">
                    Voltar para Meus Cadernos
                  </Button>
                </Link>
              </div>
            )
          }
        />
      </div>
    </div>
  )
}
