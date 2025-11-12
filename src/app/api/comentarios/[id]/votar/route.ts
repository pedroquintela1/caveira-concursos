import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema de validação para voto
const votoSchema = z.object({
  tipo: z.enum(['upvote', 'downvote'], {
    errorMap: () => ({ message: 'Tipo de voto deve ser "upvote" ou "downvote"' }),
  }),
})

/**
 * POST /api/comentarios/[id]/votar
 * Votar em um comentário (upvote ou downvote)
 * Regras:
 * - Apenas PREMIUM pode votar
 * - Um usuário só pode votar uma vez por comentário
 * - Pode mudar o voto (de upvote para downvote ou vice-versa)
 * - Pode remover voto votando no mesmo tipo novamente
 */
export async function POST(
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

    // 2. Verificar plano (apenas PREMIUM pode votar)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    if (!profile || profile.plano !== 'premium') {
      return NextResponse.json(
        {
          error: 'Votação disponível apenas para plano PREMIUM',
          hint: 'Faça upgrade para PREMIUM para votar em comentários',
          paywall: true,
        },
        { status: 403 }
      )
    }

    // 3. Validar body
    const body = await request.json()
    const validacao = votoSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          detalhes: validacao.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { tipo } = validacao.data

    // 4. Verificar se comentário existe
    const { data: comentario, error: comentarioError } = await supabase
      .from('questoes_comentarios')
      .select('id, upvotes, downvotes')
      .eq('id', comentarioId)
      .single()

    if (comentarioError || !comentario) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // 5. Verificar se usuário já votou neste comentário
    const { data: votoExistente, error: votoExistenteError } = await supabase
      .from('comentarios_votos')
      .select('id, tipo')
      .eq('comentario_id', comentarioId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (votoExistenteError) {
      console.error('Erro ao verificar voto existente:', votoExistenteError)
      return NextResponse.json(
        { error: 'Erro ao verificar voto' },
        { status: 500 }
      )
    }

    let novoVoto = null

    // 6. Processar voto
    if (!votoExistente) {
      // Caso 1: Usuário ainda não votou - CRIAR voto
      const { data: created, error: createError } = await supabase
        .from('comentarios_votos')
        .insert({
          comentario_id: comentarioId,
          user_id: user.id,
          tipo,
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar voto:', createError)
        return NextResponse.json({ error: 'Erro ao votar' }, { status: 500 })
      }

      // Atualizar contador no comentário
      const field = tipo === 'upvote' ? 'upvotes' : 'downvotes'
      await supabase
        .from('questoes_comentarios')
        .update({ [field]: (comentario[field] || 0) + 1 })
        .eq('id', comentarioId)

      novoVoto = created
    } else if (votoExistente.tipo === tipo) {
      // Caso 2: Votou no mesmo tipo - REMOVER voto
      const { error: deleteError } = await supabase
        .from('comentarios_votos')
        .delete()
        .eq('id', votoExistente.id)

      if (deleteError) {
        console.error('Erro ao remover voto:', deleteError)
        return NextResponse.json(
          { error: 'Erro ao remover voto' },
          { status: 500 }
        )
      }

      // Atualizar contador no comentário
      const field = tipo === 'upvote' ? 'upvotes' : 'downvotes'
      await supabase
        .from('questoes_comentarios')
        .update({ [field]: Math.max((comentario[field] || 0) - 1, 0) })
        .eq('id', comentarioId)

      novoVoto = null
    } else {
      // Caso 3: Mudou de upvote para downvote (ou vice-versa) - ATUALIZAR
      const { data: updated, error: updateError } = await supabase
        .from('comentarios_votos')
        .update({ tipo })
        .eq('id', votoExistente.id)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar voto:', updateError)
        return NextResponse.json(
          { error: 'Erro ao mudar voto' },
          { status: 500 }
        )
      }

      // Atualizar contadores (decrementa o antigo, incrementa o novo)
      const oldField = votoExistente.tipo === 'upvote' ? 'upvotes' : 'downvotes'
      const newField = tipo === 'upvote' ? 'upvotes' : 'downvotes'

      await supabase
        .from('questoes_comentarios')
        .update({
          [oldField]: Math.max((comentario[oldField] || 0) - 1, 0),
          [newField]: (comentario[newField] || 0) + 1,
        })
        .eq('id', comentarioId)

      novoVoto = updated
    }

    // 7. Buscar comentário atualizado
    const { data: comentarioAtualizado } = await supabase
      .from('questoes_comentarios')
      .select('id, upvotes, downvotes')
      .eq('id', comentarioId)
      .single()

    return NextResponse.json({
      success: true,
      voto: novoVoto ? novoVoto.tipo : null,
      comentario: {
        id: comentarioAtualizado?.id,
        upvotes: comentarioAtualizado?.upvotes || 0,
        downvotes: comentarioAtualizado?.downvotes || 0,
        total_votos:
          (comentarioAtualizado?.upvotes || 0) -
          (comentarioAtualizado?.downvotes || 0),
      },
      message: novoVoto
        ? `Voto registrado: ${novoVoto.tipo}`
        : 'Voto removido',
    })
  } catch (error) {
    console.error('Erro inesperado em POST /api/comentarios/[id]/votar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
