import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ====================================
// SCHEMAS DE VALIDAÇÃO
// ====================================

const createCadernoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  descricao: z.string().optional(),
  pasta_id: z.number().int().positive().nullable().optional(), // 🆕 Pasta onde o caderno será criado
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
  limite_questoes: z
    .number()
    .int()
    .min(1, 'Deve ter no mínimo 1 questão')
    .max(500, 'Máximo de 500 questões por caderno')
    .default(50),
})

// Limites por plano
const PLAN_LIMITS = {
  free: { max_cadernos: 2, max_questoes: 50 },
  basic: { max_cadernos: 10, max_questoes: 200 },
  premium: { max_cadernos: 999999, max_questoes: 500 },
} as const

// ====================================
// GET: Listar Cadernos do Usuário
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
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // 2. Buscar query params (filtros opcionais)
    const { searchParams } = new URL(request.url)
    const is_ativo = searchParams.get('is_ativo') // true/false/null
    const is_concluido = searchParams.get('is_concluido')

    // 3. Query Supabase
    let query = supabase
      .from('cadernos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros (apenas is_concluido, removendo is_ativo por enquanto)
    if (is_concluido !== null) {
      query = query.eq('is_concluido', is_concluido === 'true')
    }

    const { data: cadernos, error: dbError } = await query

    if (dbError) {
      console.error('Erro ao buscar cadernos:', dbError)
      return NextResponse.json(
        { error: 'Erro ao buscar cadernos. Tente novamente.' },
        { status: 500 }
      )
    }

    // 4. Buscar informações do plano para retornar limites
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    const userPlan = (profile?.plano || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[userPlan]

    // 5. Contar cadernos não concluídos (como "ativos")
    const activeCadernos = cadernos?.filter((c) => !c.is_concluido).length || 0

    return NextResponse.json({
      cadernos: cadernos || [],
      meta: {
        total: cadernos?.length || 0,
        ativos: activeCadernos,
        limite_ativos: limits.max_cadernos,
        limite_questoes_por_caderno: limits.max_questoes,
        plano: userPlan,
        pode_criar_mais: activeCadernos < limits.max_cadernos,
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar cadernos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// POST: Criar Novo Caderno
// ====================================

export async function POST(request: NextRequest) {
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
    const validation = createCadernoSchema.safeParse(body)

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

    // 3. Buscar plano do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    const userPlan = (profile?.plano || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[userPlan]

    // 4. Validar limite de questões por plano
    if (data.limite_questoes && data.limite_questoes > limits.max_questoes) {
      return NextResponse.json(
        {
          error: `Plano ${userPlan.toUpperCase()} permite no máximo ${limits.max_questoes} questões por caderno.`,
          upgrade_required: userPlan !== 'premium',
          current_plan: userPlan,
          limit: limits.max_questoes,
        },
        { status: 403 }
      )
    }

    // 5. Contar cadernos não concluídos (ativos)
    const { count } = await supabase
      .from('cadernos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_concluido', false)

    // 6. Validar limite de cadernos ativos
    if (count !== null && count >= limits.max_cadernos) {
      return NextResponse.json(
        {
          error: `Limite de cadernos ativos atingido. Plano ${userPlan.toUpperCase()} permite ${limits.max_cadernos} caderno(s) ativo(s).`,
          hint: 'Desative um caderno existente ou faça upgrade do plano.',
          upgrade_required: userPlan !== 'premium',
          current_plan: userPlan,
          current_active: count,
          limit: limits.max_cadernos,
        },
        { status: 403 }
      )
    }

    // 7. Se tem pasta_id, validar que a pasta existe e pertence ao usuário
    if (data.pasta_id) {
      const { data: pasta, error: pastaError } = await supabase
        .from('pastas_cadernos')
        .select('id')
        .eq('id', data.pasta_id)
        .eq('user_id', user.id)
        .single()

      if (pastaError || !pasta) {
        return NextResponse.json(
          {
            error: 'Pasta não encontrada ou você não tem permissão.',
          },
          { status: 404 }
        )
      }
    }

    // 8. Criar caderno com filtros nas colunas corretas
    const { data: novoCaderno, error: createError } = await supabase
      .from('cadernos')
      .insert({
        user_id: user.id,
        nome: data.nome,
        descricao: data.descricao || null,
        pasta_id: data.pasta_id || null, // 🆕 Associar à pasta
        disciplina_id: data.disciplina_id || null,
        banca_id: data.banca_id || null,
        orgao_id: data.orgao_id || null,
        ano_inicio: data.ano_inicio || null,
        ano_fim: data.ano_fim || null,
        dificuldade: data.dificuldade || null,
        limite_questoes: data.limite_questoes || 50,
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Erro ao criar caderno:', createError)

      // Tratar erro de trigger (limite de cadernos)
      if (createError.message.includes('Limite de cadernos')) {
        return NextResponse.json(
          {
            error: createError.message,
            upgrade_required: userPlan !== 'premium',
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar caderno. Tente novamente.' },
        { status: 500 }
      )
    }

    // 9. Retornar sucesso
    return NextResponse.json(
      {
        message: 'Caderno criado com sucesso!',
        caderno: novoCaderno,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado ao criar caderno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
