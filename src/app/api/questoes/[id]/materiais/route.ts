import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ====================================
// GET: Listar Materiais Extras da Questão
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

    // 2. Validar ID da questão
    const questaoId = parseInt(params.id)
    if (isNaN(questaoId)) {
      return NextResponse.json(
        { error: 'ID de questão inválido.' },
        { status: 400 }
      )
    }

    // 3. Verificar plano do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado.' },
        { status: 404 }
      )
    }

    // 4. Verificar se questão existe
    const { data: questao, error: questaoError } = await supabase
      .from('questoes')
      .select('id')
      .eq('id', questaoId)
      .single()

    if (questaoError || !questao) {
      return NextResponse.json(
        { error: 'Questão não encontrada.' },
        { status: 404 }
      )
    }

    // 5. Buscar materiais (temporariamente retornando vazio - feature não implementada)
    // TODO: Implementar tabela questoes_materiais_extras e RPC get_materiais_questao
    const materiais: any[] = []

    // 6. Agrupar materiais por tipo
    const materiaisPorTipo = {
      videos: [],
      pdfs: [],
      links: [],
      artigos: [],
    }

    // 7. Calcular estatísticas
    const totalMateriais = 0
    const materiaisVisualizados = 0
    const materiaisCompletados = 0

    // 8. Verificar permissões
    const isPremium = profile.plano === 'premium'
    const materiaisDisponiveis: any[] = []

    return NextResponse.json({
      materiais: materiaisDisponiveis || [],
      materiais_por_tipo: {
        videos: materiaisPorTipo.videos.filter((m: any) => isPremium || m.is_gratuito),
        pdfs: materiaisPorTipo.pdfs.filter((m: any) => isPremium || m.is_gratuito),
        links: materiaisPorTipo.links.filter((m: any) => isPremium || m.is_gratuito),
        artigos: materiaisPorTipo.artigos.filter((m: any) => isPremium || m.is_gratuito),
      },
      meta: {
        total: totalMateriais,
        total_disponiveis: materiaisDisponiveis?.length || 0,
        visualizados: materiaisVisualizados,
        completados: materiaisCompletados,
        percentual_completo:
          totalMateriais > 0
            ? Math.round((materiaisCompletados / totalMateriais) * 100)
            : 0,
      },
      permissoes: {
        pode_visualizar_todos: isPremium,
        plano_atual: profile.plano,
        plano_necessario: 'premium',
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar materiais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// POST: Registrar Visualização de Material
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

    // 2. Validar ID da questão
    const questaoId = parseInt(params.id)
    if (isNaN(questaoId)) {
      return NextResponse.json(
        { error: 'ID de questão inválido.' },
        { status: 400 }
      )
    }

    // 3. Verificar plano do usuário (PREMIUM para visualizar materiais)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado.' },
        { status: 404 }
      )
    }

    if (profile.plano !== 'premium') {
      return NextResponse.json(
        {
          error: 'Acesso negado.',
          message: 'Materiais extras estão disponíveis apenas para usuários PREMIUM.',
          plano_necessario: 'premium',
        },
        { status: 403 }
      )
    }

    // 4. Validar body
    const body = await request.json()
    const { material_id, tempo_assistido = 0, completou = false } = body

    if (!material_id || typeof material_id !== 'number') {
      return NextResponse.json(
        { error: 'material_id é obrigatório e deve ser um número.' },
        { status: 400 }
      )
    }

    // 5. Registrar visualização (temporariamente desabilitado - feature não implementada)
    // TODO: Implementar RPC registrar_visualizacao_material

    return NextResponse.json({
      success: true,
      message: 'Feature temporariamente desabilitada.',
    })
  } catch (error) {
    console.error('Erro inesperado ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
