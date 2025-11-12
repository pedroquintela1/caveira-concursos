import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ====================================
// GET: Buscar Questões do Caderno
// ====================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // 2. Validar ID
    const cadernoId = parseInt(params.id, 10)
    if (isNaN(cadernoId)) {
      return NextResponse.json(
        { error: 'ID do caderno inválido.' },
        { status: 400 }
      )
    }

    // 3. Buscar query params (paginação e filtros)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100) // Max 100
    const offset = (page - 1) * limit
    const apenas_nao_respondidas = searchParams.get('apenas_nao_respondidas') === 'true'

    // 4. Chamar função RPC do Supabase para buscar questões filtradas
    const { data: questoes, error: rpcError } = await supabase.rpc(
      'get_caderno_questoes',
      {
        p_caderno_id: cadernoId,
        p_user_id: user.id,
      }
    )

    if (rpcError) {
      console.error('Erro ao buscar questões do caderno:', rpcError)

      // Tratar erro de permissão (caderno não pertence ao usuário)
      if (rpcError.message.includes('não encontrado')) {
        return NextResponse.json(
          {
            error: 'Caderno não encontrado ou você não tem permissão para acessá-lo.',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao buscar questões. Tente novamente.' },
        { status: 500 }
      )
    }

    // 5. Filtrar apenas não respondidas se solicitado
    let questoesFiltradas = questoes || []
    if (apenas_nao_respondidas) {
      questoesFiltradas = questoesFiltradas.filter(
        (q: any) => q.ja_respondida === false
      )
    }

    // 6. Aplicar paginação
    const total = questoesFiltradas.length
    const questoesPaginadas = questoesFiltradas.slice(offset, offset + limit)

    // 7. Buscar informações do caderno para contexto
    const { data: caderno } = await supabase
      .from('cadernos')
      .select('nome, limite_questoes, questoes_respondidas, taxa_acerto')
      .eq('id', cadernoId)
      .eq('user_id', user.id)
      .single()

    // 8. Retornar questões com metadata
    return NextResponse.json({
      questoes: questoesPaginadas,
      meta: {
        total_questoes: total,
        total_respondidas: questoes?.filter((q: any) => q.ja_respondida).length || 0,
        total_nao_respondidas: questoes?.filter((q: any) => !q.ja_respondida).length || 0,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
      caderno: caderno || null,
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar questões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// POST: Obter Próxima Questão Não Respondida
// ====================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // 2. Validar ID
    const cadernoId = parseInt(params.id, 10)
    if (isNaN(cadernoId)) {
      return NextResponse.json(
        { error: 'ID do caderno inválido.' },
        { status: 400 }
      )
    }

    // 3. Buscar próxima questão não respondida
    const { data: questoes, error: rpcError } = await supabase.rpc(
      'get_caderno_questoes',
      {
        p_caderno_id: cadernoId,
        p_user_id: user.id,
      }
    )

    if (rpcError) {
      console.error('Erro ao buscar questões:', rpcError)
      return NextResponse.json(
        { error: 'Erro ao buscar próxima questão.' },
        { status: 500 }
      )
    }

    // 4. Filtrar primeira questão não respondida
    const proximaQuestao = questoes?.find((q: any) => q.ja_respondida === false)

    if (!proximaQuestao) {
      // Caderno concluído
      const { data: caderno } = await supabase
        .from('cadernos')
        .select('nome, questoes_respondidas, limite_questoes, taxa_acerto')
        .eq('id', cadernoId)
        .single()

      return NextResponse.json(
        {
          message: 'Parabéns! Você completou todas as questões deste caderno!',
          caderno_concluido: true,
          caderno,
        },
        { status: 200 }
      )
    }

    // 5. Buscar índice da questão (posição no caderno)
    const indice = questoes?.findIndex((q: any) => q.id === proximaQuestao.id) || 0

    return NextResponse.json({
      questao: proximaQuestao,
      meta: {
        indice: indice + 1, // 1-indexed
        total: questoes?.length || 0,
        total_respondidas: questoes?.filter((q: any) => q.ja_respondida).length || 0,
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar próxima questão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
