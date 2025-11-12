import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bancaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sigla: z.string().min(2, 'Sigla deve ter pelo menos 2 caracteres'),
  website: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  logo_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  is_active: z.boolean().default(true),
});

// GET - Buscar banca por ID
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

    const { data: banca, error } = await supabase
      .from('bancas')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !banca) {
      return NextResponse.json({ error: 'Banca não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ banca }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar banca:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar banca
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
      website: body.website === '' ? null : body.website,
      logo_url: body.logo_url === '' ? null : body.logo_url,
    };

    const validationResult = bancaSchema.safeParse(processedBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const bancaData = validationResult.data;

    // Verificar se sigla já existe (exceto na própria banca)
    const { data: existente } = await supabase
      .from('bancas')
      .select('id')
      .eq('sigla', bancaData.sigla)
      .neq('id', params.id)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe outra banca com esta sigla' },
        { status: 409 }
      );
    }

    const { data: banca, error } = await supabase
      .from('bancas')
      .update(bancaData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Banca atualizada com sucesso', banca },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar banca:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar banca (soft delete)
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
      .from('bancas')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Banca desativada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar banca:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
