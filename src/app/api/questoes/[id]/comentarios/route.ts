import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ====================================
// Schemas de Validação
// ====================================

const createComentarioSchema = z.object({
  comentario: z
    .string()
    .min(10, 'Comentário deve ter no mínimo 10 caracteres')
    .max(5000, 'Comentário deve ter no máximo 5000 caracteres'),
})

// ====================================
// GET: Listar Comentários da Questão
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

    // 3. Verificar plano do usuário (BASIC+ para acessar comentários)
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

    if (profile.plano === 'free') {
      return NextResponse.json(
        {
          error: 'Acesso negado.',
          message: 'Comentários estão disponíveis apenas para planos BÁSICO e PREMIUM.',
          plano_necessario: 'basic',
        },
        { status: 403 }
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

    // 5. Buscar comentários (temporariamente retornando vazio - feature não implementada)
    // TODO: Implementar tabela questoes_comentarios e RPC get_comentarios_questao
    const comentarios: any[] = []

    // 6. Contar total de comentários
    const totalComentarios = 0
    const comentariosProfessores = 0
    const comentariosComunidade = 0

    return NextResponse.json({
      comentarios: comentarios || [],
      meta: {
        total: totalComentarios,
        professores: comentariosProfessores,
        comunidade: comentariosComunidade,
      },
      permissoes: {
        pode_comentar: profile.plano === 'premium',
        pode_votar: profile.plano === 'premium',
        pode_ler: ['basic', 'premium'].includes(profile.plano),
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar comentários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// POST: Criar Novo Comentário
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

    // 3. Verificar plano do usuário (PREMIUM para criar comentários)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plano, nome_completo, foto_url')
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
          message: 'Apenas usuários PREMIUM podem criar comentários.',
          plano_necessario: 'premium',
        },
        { status: 403 }
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

    // 5. Validar body
    const body = await request.json()
    const validacao = createComentarioSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos.',
          detalhes: validacao.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // 6. Inserir comentário
    const { data: novoComentario, error: insertError } = await supabase
      .from('questoes_comentarios')
      .insert({
        questao_id: questaoId,
        user_id: user.id,
        comentario: validacao.data.comentario,
        tipo: 'comunidade',
        is_professor: false,
      })
      .select(`
        id,
        questao_id,
        user_id,
        comentario,
        tipo,
        is_professor,
        votos_positivos,
        votos_negativos,
        is_editado,
        created_at,
        updated_at
      `)
      .single()

    if (insertError) {
      console.error('Erro ao criar comentário:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar comentário.' },
        { status: 500 }
      )
    }

    // 7. Enriquecer resposta com dados do autor
    const comentarioCompleto = {
      ...novoComentario,
      autor_nome: profile.nome_completo,
      autor_foto_url: profile.foto_url,
      user_votou: null,
      total_votos: 0,
    }

    return NextResponse.json(
      {
        comentario: comentarioCompleto,
        message: 'Comentário criado com sucesso!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado ao criar comentário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
