import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação (mesmos campos da criação)
const disciplinaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional().nullable(),
  icone: z.string().optional().nullable(),
  ordem: z.number().int().min(0).default(0),
  cor_destaque: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida (use formato #RRGGBB)').default('#2563EB'),
  is_active: z.boolean().default(true),
});

// GET - Buscar disciplina por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: disciplina, error } = await supabase
      .from('disciplinas')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !disciplina) {
      return NextResponse.json({ error: 'Disciplina não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ disciplina }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar disciplina
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

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

    // Verificar se slug já existe (exceto na própria disciplina)
    const { data: existente } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('slug', disciplinaData.slug)
      .neq('id', params.id)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe outra disciplina com este slug' },
        { status: 409 }
      );
    }

    // Atualizar
    const { data: disciplina, error } = await supabase
      .from('disciplinas')
      .update(disciplinaData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Disciplina atualizada com sucesso', disciplina },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar disciplina (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Soft delete (is_active = false)
    const { error } = await supabase
      .from('disciplinas')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Disciplina desativada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar disciplina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
