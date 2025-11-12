import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ====================================
// DEBUG: Diagnosticar problemas com cadernos
// ====================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Buscar último caderno criado pelo usuário
    const { data: ultimoCaderno, error: cadernoError } = await supabase
      .from('cadernos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cadernoError) {
      return NextResponse.json({
        error: 'Nenhum caderno encontrado',
        details: cadernoError.message,
      })
    }

    // 3. Contar total de questões no banco
    const { count: totalQuestoes } = await supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 4. Contar questões com os filtros do caderno (query manual)
    let queryQuestoes = supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (ultimoCaderno.disciplina_id) {
      queryQuestoes = queryQuestoes.eq('disciplina_id', ultimoCaderno.disciplina_id)
    }
    if (ultimoCaderno.banca_id) {
      queryQuestoes = queryQuestoes.eq('banca_id', ultimoCaderno.banca_id)
    }
    if (ultimoCaderno.orgao_id) {
      queryQuestoes = queryQuestoes.eq('orgao_id', ultimoCaderno.orgao_id)
    }

    const { count: questoesComFiltros } = await queryQuestoes

    // 5. Tentar chamar a função RPC
    let rpcResult = null
    let rpcError = null
    try {
      const { data: questoesRPC, error: rpcErr } = await supabase.rpc(
        'get_caderno_questoes',
        {
          p_caderno_id: ultimoCaderno.id,
          p_user_id: user.id,
        }
      )
      rpcResult = questoesRPC
      rpcError = rpcErr
    } catch (err: any) {
      rpcError = err.message
    }

    // 6. Buscar informações de disciplinas
    const { data: disciplinas } = await supabase
      .from('disciplinas')
      .select('id, nome')
      .limit(10)

    // 7. Buscar questões por disciplina (top 5)
    const { data: questoesPorDisciplina } = await supabase
      .from('questoes')
      .select('disciplina_id, disciplinas(nome)')
      .eq('is_active', true)
      .limit(100)

    const disciplinasCount = questoesPorDisciplina?.reduce((acc: any, q: any) => {
      const disciplinaId = q.disciplina_id
      const disciplinaNome = q.disciplinas?.nome || 'Sem disciplina'
      acc[disciplinaNome] = (acc[disciplinaNome] || 0) + 1
      return acc
    }, {})

    // 8. Retornar diagnóstico completo
    return NextResponse.json({
      diagnostico: 'Informações coletadas com sucesso',

      ultimo_caderno: {
        id: ultimoCaderno.id,
        nome: ultimoCaderno.nome,
        filtros: {
          disciplina_id: ultimoCaderno.disciplina_id,
          banca_id: ultimoCaderno.banca_id,
          orgao_id: ultimoCaderno.orgao_id,
          ano_inicio: ultimoCaderno.ano_inicio,
          ano_fim: ultimoCaderno.ano_fim,
          dificuldade: ultimoCaderno.dificuldade,
          limite_questoes: ultimoCaderno.limite_questoes,
        },
        created_at: ultimoCaderno.created_at,
      },

      questoes: {
        total_no_banco: totalQuestoes,
        com_filtros_do_caderno: questoesComFiltros,
        por_disciplina: disciplinasCount,
      },

      funcao_rpc: {
        existe: rpcError === null || rpcError?.code !== 'PGRST202',
        erro: rpcError,
        resultado: rpcResult ? `${rpcResult.length} questões retornadas` : 'Nenhuma questão retornada',
        detalhes: rpcResult?.slice(0, 2), // Primeiras 2 questões
      },

      disciplinas_disponiveis: disciplinas?.map(d => ({ id: d.id, nome: d.nome })),

      possivel_problema:
        totalQuestoes === 0
          ? '❌ Não existem questões no banco de dados'
          : questoesComFiltros === 0
          ? '⚠️ Existem questões no banco, mas nenhuma corresponde aos filtros do caderno'
          : rpcError
          ? '❌ A função RPC não existe ou está com erro'
          : rpcResult?.length === 0
          ? '⚠️ A função RPC existe mas não retornou questões (verificar lógica dos filtros)'
          : '✅ Tudo parece OK (verifique o frontend)',
    })
  } catch (error: any) {
    console.error('Erro no diagnóstico:', error)
    return NextResponse.json(
      { error: 'Erro ao executar diagnóstico', details: error.message },
      { status: 500 }
    )
  }
}
