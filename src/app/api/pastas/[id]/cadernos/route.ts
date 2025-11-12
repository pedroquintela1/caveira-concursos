import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ====================================
// GET: Listar Cadernos de uma Pasta
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
    const pastaId = parseInt(params.id)
    if (isNaN(pastaId)) {
      return NextResponse.json(
        { error: 'ID de pasta inválido.' },
        { status: 400 }
      )
    }

    // 3. Verificar se pasta existe e pertence ao usuário
    const { data: pasta, error: pastaError } = await supabase
      .from('pastas_cadernos')
      .select('id, nome, icone, cor')
      .eq('id', pastaId)
      .eq('user_id', user.id)
      .single()

    if (pastaError || !pasta) {
      return NextResponse.json(
        { error: 'Pasta não encontrada ou você não tem permissão.' },
        { status: 404 }
      )
    }

    // 4. Buscar query params (filtros opcionais)
    const { searchParams } = new URL(request.url)
    const is_concluido = searchParams.get('is_concluido')

    // 5. Query cadernos da pasta
    let query = supabase
      .from('cadernos')
      .select('*')
      .eq('pasta_id', pastaId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filtrar por status de conclusão
    if (is_concluido !== null) {
      query = query.eq('is_concluido', is_concluido === 'true')
    }

    const { data: cadernos, error: dbError } = await query

    if (dbError) {
      console.error('Erro ao buscar cadernos da pasta:', dbError)
      return NextResponse.json(
        { error: 'Erro ao buscar cadernos. Tente novamente.' },
        { status: 500 }
      )
    }

    // 6. Calcular estatísticas
    const stats = {
      total: cadernos?.length || 0,
      ativos: cadernos?.filter((c) => !c.is_concluido).length || 0,
      concluidos: cadernos?.filter((c) => c.is_concluido).length || 0,
      total_questoes: cadernos?.reduce((sum, c) => sum + (c.total_questoes || 0), 0) || 0,
      questoes_resolvidas: cadernos?.reduce((sum, c) => sum + (c.questoes_resolvidas || 0), 0) || 0,
    }

    return NextResponse.json({
      pasta: {
        id: pasta.id,
        nome: pasta.nome,
        icone: pasta.icone,
        cor: pasta.cor,
      },
      cadernos: cadernos || [],
      stats,
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar cadernos da pasta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
