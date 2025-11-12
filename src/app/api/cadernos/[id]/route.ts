import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ====================================
// SCHEMAS DE VALIDAÇÃO
// ====================================

const updateCadernoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),
  descricao: z.string().optional(),
  pasta_id: z.number().int().positive().nullable().optional(), // 🆕 Mover para pasta
  disciplina_id: z.number().int().positive().nullable().optional(),
  banca_id: z.number().int().positive().nullable().optional(),
  orgao_id: z.number().int().positive().nullable().optional(),
  ano_inicio: z
    .number()
    .int()
    .min(2000)
    .max(2100)
    .nullable()
    .optional(),
  ano_fim: z
    .number()
    .int()
    .min(2000)
    .max(2100)
    .nullable()
    .optional(),
  dificuldade: z
    .enum(['facil', 'media', 'dificil'])
    .nullable()
    .optional(),
  is_ativo: z.boolean().optional(),
})

// ====================================
// GET: Buscar Caderno por ID
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

    // 3. Buscar caderno
    const { data: caderno, error: dbError } = await supabase
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
      .eq('user_id', user.id) // RLS, mas validamos explicitamente
      .single()

    if (dbError || !caderno) {
      return NextResponse.json(
        { error: 'Caderno não encontrado ou você não tem permissão para acessá-lo.' },
        { status: 404 }
      )
    }

    // 4. Buscar progresso (quantidade de questões respondidas neste caderno)
    const { count: questoesRespondidas } = await supabase
      .from('respostas_usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('caderno_id', cadernoId)

    return NextResponse.json({
      caderno: {
        ...caderno,
        progresso: {
          questoes_respondidas: questoesRespondidas || 0,
          percentual:
            ((questoesRespondidas || 0) / caderno.limite_questoes) * 100,
        },
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar caderno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// PUT: Atualizar Caderno
// ====================================

export async function PUT(
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

    // 3. Parse e validar body
    const body = await request.json()
    const validation = updateCadernoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // 4. Verificar se caderno existe e pertence ao usuário
    const { data: existingCaderno, error: checkError } = await supabase
      .from('cadernos')
      .select('id, user_id, is_concluido')
      .eq('id', cadernoId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingCaderno) {
      return NextResponse.json(
        { error: 'Caderno não encontrado ou você não tem permissão para editá-lo.' },
        { status: 404 }
      )
    }

    // 5. Validar regras de negócio
    if (existingCaderno.is_concluido && data.is_ativo === false) {
      return NextResponse.json(
        {
          error: 'Não é possível desativar um caderno já concluído.',
          hint: 'Cadernos concluídos ficam no histórico.',
        },
        { status: 400 }
      )
    }

    // 6. Atualizar caderno
    const { data: updatedCaderno, error: updateError } = await supabase
      .from('cadernos')
      .update(data)
      .eq('id', cadernoId)
      .eq('user_id', user.id)
      .select(
        `
        *,
        disciplinas:disciplina_id(id, nome, slug),
        bancas:banca_id(id, nome, sigla),
        orgaos:orgao_id(id, nome, sigla)
      `
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar caderno:', updateError)

      // Tratar erro de trigger (limite de cadernos ao reativar)
      if (updateError.message.includes('Limite de cadernos')) {
        return NextResponse.json(
          {
            error: updateError.message,
            upgrade_required: true,
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar caderno. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Caderno atualizado com sucesso!',
      caderno: updatedCaderno,
    })
  } catch (error) {
    console.error('Erro inesperado ao atualizar caderno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// DELETE: Deletar Caderno
// ====================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    console.log('🗑️ DELETE /api/cadernos/[id] - Iniciando...')
    console.log('   Params:', params)
    console.log('   URL:', request.url)

    // 1. Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    console.log('✅ Usuário autenticado:', user.id)

    // 2. Validar ID
    const cadernoId = parseInt(params.id, 10)
    if (isNaN(cadernoId)) {
      console.error('❌ ID inválido:', params.id)
      return NextResponse.json(
        { error: 'ID do caderno inválido.' },
        { status: 400 }
      )
    }

    console.log('✅ ID válido:', cadernoId)

    // 3. Verificar se caderno existe e pertence ao usuário
    const { data: existingCaderno, error: checkError } = await supabase
      .from('cadernos')
      .select('id, user_id, questoes_respondidas')
      .eq('id', cadernoId)
      .eq('user_id', user.id)
      .single()

    // Tratar erro específico "not found" (PGRST116)
    if (checkError) {
      console.error('Erro ao verificar caderno:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
      })

      // Se é erro de "not found", pode ser que o caderno não exista ou não pertença ao usuário
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'Caderno não encontrado ou você não tem permissão para deletá-lo.',
            debug_info: `Caderno ID ${cadernoId} não encontrado para o usuário atual`,
          },
          { status: 404 }
        )
      }

      // Outro erro de banco
      return NextResponse.json(
        {
          error: 'Erro ao verificar caderno no banco de dados.',
          debug_info: checkError.message,
        },
        { status: 500 }
      )
    }

    if (!existingCaderno) {
      return NextResponse.json(
        { error: 'Caderno não encontrado.' },
        { status: 404 }
      )
    }

    console.log('✅ Caderno encontrado:', {
      id: existingCaderno.id,
      user_id: existingCaderno.user_id,
      questoes_respondidas: existingCaderno.questoes_respondidas,
    })

    // 4. Aviso se caderno tem progresso
    if (existingCaderno.questoes_respondidas && existingCaderno.questoes_respondidas > 0) {
      // Opcional: adicionar confirmação via query param ?confirm=true
      const { searchParams } = new URL(request.url)
      const confirm = searchParams.get('confirm')

      console.log('⚠️ Caderno tem progresso. Confirm param:', confirm)

      if (confirm !== 'true') {
        console.log('❌ Confirmação necessária, retornando 409')
        return NextResponse.json(
          {
            warning:
              'Este caderno possui questões respondidas. Tem certeza que deseja deletá-lo?',
            questoes_respondidas: existingCaderno.questoes_respondidas,
            hint: 'Adicione ?confirm=true à URL para confirmar a exclusão.',
          },
          { status: 409 } // Conflict
        )
      }
    }

    // 5. Deletar caderno (CASCADE deleta respostas_usuarios com caderno_id)
    console.log('🗑️ Executando DELETE...')
    const { error: deleteError } = await supabase
      .from('cadernos')
      .delete()
      .eq('id', cadernoId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Erro ao deletar caderno:', {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
      })
      return NextResponse.json(
        { error: 'Erro ao deletar caderno. Tente novamente.', debug_info: deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ Caderno deletado com sucesso!')
    return NextResponse.json(
      {
        message: 'Caderno deletado com sucesso!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro inesperado ao deletar caderno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
