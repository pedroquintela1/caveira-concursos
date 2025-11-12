import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema de validação
const updateProfileSchema = z.object({
  nome_exibicao: z.string().max(100).nullable().optional(),
  nome_completo: z.string().max(200).nullable().optional(),
  concurso_alvo: z.string().max(200).nullable().optional(),
  meta_questoes_dia: z.number().int().min(1).max(500).optional(),
})

// PUT: Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
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

    // 2. Parse e validar body
    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)

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

    // 3. Atualizar perfil
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        nome_exibicao: data.nome_exibicao,
        nome_completo: data.nome_completo,
        concurso_alvo: data.concurso_alvo,
        meta_questoes_dia: data.meta_questoes_dia,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso!',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Erro inesperado ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// GET: Buscar perfil do usuário
export async function GET() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Erro ao buscar perfil.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
