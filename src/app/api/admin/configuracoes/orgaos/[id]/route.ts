import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const orgaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sigla: z.string().min(2, 'Sigla deve ter pelo menos 2 caracteres'),
  esfera: z.enum(['federal', 'estadual', 'municipal']).nullable().optional(),
  area: z.string().nullable().optional(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').nullable().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

// GET - Buscar órgão por ID
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

    const { data: orgao, error } = await supabase
      .from('orgaos')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !orgao) {
      return NextResponse.json({ error: 'Órgão não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ orgao }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar órgão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar órgão
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

    const body = await request.json();

    // Converter strings vazias para null
    const processedBody = {
      ...body,
      uf: body.uf === '' ? null : body.uf?.toUpperCase(),
      area: body.area === '' ? null : body.area,
      esfera: body.esfera === '' ? null : body.esfera,
    };

    const validationResult = orgaoSchema.safeParse(processedBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const orgaoData = validationResult.data;

    // Verificar se sigla já existe (exceto no próprio órgão)
    const { data: existente } = await supabase
      .from('orgaos')
      .select('id')
      .eq('sigla', orgaoData.sigla)
      .neq('id', params.id)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe outro órgão com esta sigla' },
        { status: 409 }
      );
    }

    const { data: orgao, error } = await supabase
      .from('orgaos')
      .update(orgaoData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Órgão atualizado com sucesso', orgao },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar órgão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar órgão (soft delete)
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

    const { error } = await supabase
      .from('orgaos')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Órgão desativado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar órgão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
