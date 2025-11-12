import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ====================================
// SCHEMAS DE VALIDAÇÃO
// ====================================

const createPastaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  descricao: z.string().optional(),
  parent_id: z.number().int().positive().nullable().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar em formato hexadecimal (#RRGGBB)')
    .default('#8fbc8f'),
  icone: z.string().max(50).default('folder'),
  ordem: z.number().int().min(0).default(0),
})

// Limites por plano
const PLAN_LIMITS = {
  free: { max_pastas: 0 }, // FREE não pode criar pastas
  basic: { max_pastas: 5 },
  premium: { max_pastas: 999999 }, // Ilimitado
} as const

// ====================================
// GET: Listar Pastas do Usuário
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
    const tree = searchParams.get('tree') === 'true' // Se true, usa função get_pastas_tree
    const parent_id = searchParams.get('parent_id') // Filtrar por parent_id

    // 3. Se tree=true, usar função recursiva do PostgreSQL
    if (tree) {
      const { data: pastasTree, error: treeError } = await supabase.rpc(
        'get_pastas_tree',
        { p_user_id: user.id }
      )

      if (treeError) {
        console.error('Erro ao buscar árvore de pastas:', treeError)
        return NextResponse.json(
          { error: 'Erro ao buscar pastas. Tente novamente.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        pastas: pastasTree || [],
        meta: {
          total: pastasTree?.length || 0,
          tree_view: true,
        },
      })
    }

    // 4. Query simples (flat list)
    let query = supabase
      .from('pastas_cadernos')
      .select('*, cadernos(count)')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false })

    // Filtrar por parent_id se fornecido
    if (parent_id === 'null' || parent_id === '') {
      query = query.is('parent_id', null) // Apenas pastas raiz
    } else if (parent_id) {
      query = query.eq('parent_id', parseInt(parent_id))
    }

    const { data: pastas, error: dbError } = await query

    if (dbError) {
      console.error('Erro ao buscar pastas:', dbError)
      return NextResponse.json(
        { error: 'Erro ao buscar pastas. Tente novamente.' },
        { status: 500 }
      )
    }

    // 5. Buscar informações do plano para retornar limites
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single()

    const userPlan = (profile?.plano || 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[userPlan]

    return NextResponse.json({
      pastas: pastas || [],
      meta: {
        total: pastas?.length || 0,
        limite_pastas: limits.max_pastas,
        plano: userPlan,
        pode_criar_mais: (pastas?.length || 0) < limits.max_pastas,
      },
    })
  } catch (error) {
    console.error('Erro inesperado ao buscar pastas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// ====================================
// POST: Criar Nova Pasta
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
    const validation = createPastaSchema.safeParse(body)

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

    // 4. FREE não pode criar pastas
    if (userPlan === 'free') {
      return NextResponse.json(
        {
          error: 'Recurso não disponível no plano FREE.',
          hint: 'Faça upgrade para o plano BÁSICO para criar até 5 pastas.',
          upgrade_required: true,
          current_plan: userPlan,
        },
        { status: 403 }
      )
    }

    // 5. Contar pastas existentes
    const { count } = await supabase
      .from('pastas_cadernos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 6. Validar limite de pastas
    if (count !== null && count >= limits.max_pastas) {
      return NextResponse.json(
        {
          error: `Limite de pastas atingido. Plano ${userPlan.toUpperCase()} permite ${limits.max_pastas} pasta(s).`,
          hint:
            userPlan === 'basic'
              ? 'Faça upgrade para PREMIUM para pastas ilimitadas.'
              : 'Exclua uma pasta existente antes de criar nova.',
          upgrade_required: userPlan !== 'premium',
          current_plan: userPlan,
          current_count: count,
          limit: limits.max_pastas,
        },
        { status: 403 }
      )
    }

    // 7. Se tem parent_id, validar que a pasta pai existe e pertence ao usuário
    if (data.parent_id) {
      const { data: parentPasta, error: parentError } = await supabase
        .from('pastas_cadernos')
        .select('id')
        .eq('id', data.parent_id)
        .eq('user_id', user.id)
        .single()

      if (parentError || !parentPasta) {
        return NextResponse.json(
          {
            error: 'Pasta pai não encontrada ou você não tem permissão.',
          },
          { status: 404 }
        )
      }
    }

    // 8. Criar pasta
    const { data: novaPasta, error: createError } = await supabase
      .from('pastas_cadernos')
      .insert({
        user_id: user.id,
        nome: data.nome,
        descricao: data.descricao || null,
        parent_id: data.parent_id || null,
        cor: data.cor,
        icone: data.icone,
        ordem: data.ordem,
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Erro ao criar pasta:', createError)

      // Tratar erro de profundidade máxima (trigger validate_pasta_depth)
      if (createError.message.includes('Profundidade máxima')) {
        return NextResponse.json(
          {
            error: 'Profundidade máxima de pastas atingida.',
            hint: 'Máximo de 5 níveis de subpastas. Crie pastas mais próximas da raiz.',
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar pasta. Tente novamente.' },
        { status: 500 }
      )
    }

    // 9. Retornar sucesso
    return NextResponse.json(
      {
        message: 'Pasta criada com sucesso!',
        pasta: novaPasta,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado ao criar pasta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
