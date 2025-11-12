import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema de validação para edição de comentário
const updateComentarioSchema = z.object({
  comentario: z
    .string()
    .min(10, 'Comentário deve ter no mínimo 10 caracteres')
    .max(2000, 'Comentário deve ter no máximo 2000 caracteres'),
})

/**
 * PUT /api/comentarios/[id]
 * Editar comentário (apenas autor, dentro de 24h)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comentarioId = parseInt(params.id)

    if (isNaN(comentarioId)) {
      return NextResponse.json(
        { error: 'ID de comentário inválido' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Validar body
    const body = await request.json()
    const validacao = updateComentarioSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          detalhes: validacao.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // 3. Buscar comentário existente
    const { data: comentarioExistente, error: fetchError } = await supabase
      .from('questoes_comentarios')
      .select('id, user_id, created_at')
      .eq('id', comentarioId)
      .single()

    if (fetchError || !comentarioExistente) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // 4. Verificar se é o autor
    if (comentarioExistente.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode editar seus próprios comentários' },
        { status: 403 }
      )
    }

    // 5. Verificar limite de 24h
    const createdAt = new Date(comentarioExistente.created_at)
    const now = new Date()
    const diff = now.getTime() - createdAt.getTime()
    const hoursElapsed = diff / (1000 * 60 * 60)

    if (hoursElapsed > 24) {
      return NextResponse.json(
        { error: 'Comentários só podem ser editados nas primeiras 24 horas' },
        { status: 403 }
      )
    }

    // 6. Atualizar comentário
    const { data: comentarioAtualizado, error: updateError } = await supabase
      .from('questoes_comentarios')
      .update({
        comentario: validacao.data.comentario,
        // is_editado será setado automaticamente pelo trigger
      })
      .eq('id', comentarioId)
      .select(
        `
        id,
        questao_id,
        user_id,
        comentario,
        tipo,
        is_professor,
        is_editado,
        upvotes,
        downvotes,
        created_at,
        updated_at
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar comentário:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar comentário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      comentario: comentarioAtualizado,
      message: 'Comentário atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro inesperado em PUT /api/comentarios/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comentarios/[id]
 * Deletar comentário (apenas autor, dentro de 24h)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comentarioId = parseInt(params.id)

    if (isNaN(comentarioId)) {
      return NextResponse.json(
        { error: 'ID de comentário inválido' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Buscar comentário existente
    const { data: comentarioExistente, error: fetchError } = await supabase
      .from('questoes_comentarios')
      .select('id, user_id, created_at')
      .eq('id', comentarioId)
      .single()

    if (fetchError || !comentarioExistente) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar se é o autor
    if (comentarioExistente.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode deletar seus próprios comentários' },
        { status: 403 }
      )
    }

    // 4. Verificar limite de 24h
    const createdAt = new Date(comentarioExistente.created_at)
    const now = new Date()
    const diff = now.getTime() - createdAt.getTime()
    const hoursElapsed = diff / (1000 * 60 * 60)

    if (hoursElapsed > 24) {
      return NextResponse.json(
        { error: 'Comentários só podem ser deletados nas primeiras 24 horas' },
        { status: 403 }
      )
    }

    // 5. Deletar comentário (CASCADE deleta votos também)
    const { error: deleteError } = await supabase
      .from('questoes_comentarios')
      .delete()
      .eq('id', comentarioId)

    if (deleteError) {
      console.error('Erro ao deletar comentário:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar comentário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Comentário deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro inesperado em DELETE /api/comentarios/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
