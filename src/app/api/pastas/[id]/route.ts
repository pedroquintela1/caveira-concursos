import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ====================================
// SCHEMAS DE VALIDAÇÃO
// ====================================

const updatePastaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),
  descricao: z.string().nullable().optional(),
  parent_id: z.number().int().positive().nullable().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar em formato hexadecimal (#RRGGBB)')
    .optional(),
  icone: z.string().max(50).optional(),
  ordem: z.number().int().min(0).optional(),
})

// ====================================
// GET: Buscar Pasta Específica
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

    // 3. Buscar pasta com contagem de cadernos
    const { data: pasta, error: dbError } = await supabase
      .from('pastas_cadernos')
      .select('*, cadernos(count)')
      .eq('id', pastaId)
      .eq('user_id', user.id)
      .single()

    if (dbError || !pasta) {
      return NextResponse.json(
        { error: 'Pasta não encontrada ou você não tem permissão.' },
        { status: 404 }
      )
    }

    // 4. Se tem parent_id, buscar informações da pasta pai
    let parentPasta = null
    if (pasta.parent_id) {
      const { data: parent } = await supabase
        .from('pastas_cadernos')
        .select('id, nome, icone')
        .eq('id', pasta.parent_id)
        .eq('user_id', user.id)
        .single()

      parentPasta = parent
    }

    return NextResponse.json({
      pasta,
      parent: parentPasta,
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar pasta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// PUT: Atualizar Pasta
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
    const pastaId = parseInt(params.id)
    if (isNaN(pastaId)) {
      return NextResponse.json(
        { error: 'ID de pasta inválido.' },
        { status: 400 }
      )
    }

    // 3. Parse e validar body
    const body = await request.json()
    const validation = updatePastaSchema.safeParse(body)

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

    // 4. Verificar se pasta existe e pertence ao usuário
    const { data: pastaExistente, error: checkError } = await supabase
      .from('pastas_cadernos')
      .select('id, parent_id')
      .eq('id', pastaId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !pastaExistente) {
      return NextResponse.json(
        { error: 'Pasta não encontrada ou você não tem permissão.' },
        { status: 404 }
      )
    }

    // 5. Se está tentando alterar parent_id, validar que não cria ciclo
    if (data.parent_id !== undefined) {
      // Não pode ser pai de si mesma
      if (data.parent_id === pastaId) {
        return NextResponse.json(
          { error: 'Uma pasta não pode ser pai de si mesma.' },
          { status: 400 }
        )
      }

      // Se tem parent_id, validar que a pasta pai existe
      if (data.parent_id) {
        const { data: parentPasta, error: parentError } = await supabase
          .from('pastas_cadernos')
          .select('id')
          .eq('id', data.parent_id)
          .eq('user_id', user.id)
          .single()

        if (parentError || !parentPasta) {
          return NextResponse.json(
            { error: 'Pasta pai não encontrada ou você não tem permissão.' },
            { status: 404 }
          )
        }
      }
    }

    // 6. Atualizar pasta
    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id
    if (data.cor !== undefined) updateData.cor = data.cor
    if (data.icone !== undefined) updateData.icone = data.icone
    if (data.ordem !== undefined) updateData.ordem = data.ordem

    const { data: pastaAtualizada, error: updateError } = await supabase
      .from('pastas_cadernos')
      .update(updateData)
      .eq('id', pastaId)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar pasta:', updateError)

      // Tratar erro de profundidade máxima
      if (updateError.message.includes('Profundidade máxima')) {
        return NextResponse.json(
          {
            error: 'Profundidade máxima de pastas atingida.',
            hint: 'Máximo de 5 níveis de subpastas.',
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar pasta. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pasta atualizada com sucesso!',
      pasta: pastaAtualizada,
    })
  } catch (error) {
    console.error('Erro inesperado ao atualizar pasta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// DELETE: Excluir Pasta
// ====================================

export async function DELETE(
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
    const { data: pasta, error: checkError } = await supabase
      .from('pastas_cadernos')
      .select('id, nome')
      .eq('id', pastaId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !pasta) {
      return NextResponse.json(
        { error: 'Pasta não encontrada ou você não tem permissão.' },
        { status: 404 }
      )
    }

    // 4. Verificar se há subpastas (ON DELETE CASCADE vai deletar, mas avisar usuário)
    const { count: subpastasCount } = await supabase
      .from('pastas_cadernos')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', pastaId)

    // 5. Verificar se há cadernos (ON DELETE SET NULL vai desassociar)
    const { count: cadernosCount } = await supabase
      .from('cadernos')
      .select('*', { count: 'exact', head: true })
      .eq('pasta_id', pastaId)

    // 6. Query param para forçar exclusão
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // 7. Se tem subpastas ou cadernos, exigir force=true
    if ((subpastasCount || cadernosCount) && !force) {
      return NextResponse.json(
        {
          error: 'Pasta contém itens e não pode ser excluída.',
          details: {
            subpastas: subpastasCount || 0,
            cadernos: cadernosCount || 0,
          },
          hint: 'Use ?force=true para confirmar a exclusão. Subpastas serão excluídas e cadernos serão desassociados.',
        },
        { status: 400 }
      )
    }

    // 8. Excluir pasta
    const { error: deleteError } = await supabase
      .from('pastas_cadernos')
      .delete()
      .eq('id', pastaId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao excluir pasta:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir pasta. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pasta excluída com sucesso!',
      deleted: {
        pasta_id: pastaId,
        pasta_nome: pasta.nome,
        subpastas_excluidas: subpastasCount || 0,
        cadernos_desassociados: cadernosCount || 0,
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao excluir pasta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
