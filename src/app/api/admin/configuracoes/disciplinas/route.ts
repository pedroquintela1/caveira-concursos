import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const disciplinaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional().nullable(),
  icone: z.string().optional().nullable(),
  ordem: z.number().int().min(0).default(0),
  cor_destaque: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida (use formato #RRGGBB)').default('#2563EB'),
  is_active: z.boolean().default(true),
});

// GET - Listar disciplinas
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Verificar autenticação admin (já foi feito no middleware, mas por segurança)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar disciplinas ordenadas
    const { data: disciplinas, error } = await supabase
      .from('disciplinas')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disciplinas }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar disciplina
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verificar autenticação admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parsear body
    const body = await request.json();

    // Validar com Zod
    const validationResult = disciplinaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const disciplinaData = validationResult.data;

    // Verificar se slug já existe
    const { data: existente } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('slug', disciplinaData.slug)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma disciplina com este slug' },
        { status: 409 }
      );
    }

    // Inserir no banco
    const { data: disciplina, error } = await supabase
      .from('disciplinas')
      .insert(disciplinaData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Disciplina criada com sucesso', disciplina },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
