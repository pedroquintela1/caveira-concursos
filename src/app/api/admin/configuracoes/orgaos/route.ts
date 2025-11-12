import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const orgaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sigla: z.string().min(2, 'Sigla deve ter pelo menos 2 caracteres'),
  esfera: z.enum(['federal', 'estadual', 'municipal']).nullable().optional(),
  area: z.string().nullable().optional(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').nullable().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

// GET - Listar órgãos
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: orgaos, error } = await supabase
      .from('orgaos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orgaos }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar órgãos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar órgão
export async function POST(request: Request) {
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

    // Verificar se sigla já existe
    const { data: existente } = await supabase
      .from('orgaos')
      .select('id')
      .eq('sigla', orgaoData.sigla)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um órgão com esta sigla' },
        { status: 409 }
      );
    }

    const { data: orgao, error } = await supabase
      .from('orgaos')
      .insert(orgaoData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Órgão criado com sucesso', orgao },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar órgão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
