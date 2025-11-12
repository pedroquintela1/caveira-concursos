import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const bancaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sigla: z.string().min(2, 'Sigla deve ter pelo menos 2 caracteres'),
  website: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  logo_url: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  is_active: z.boolean().default(true),
});

// GET - Listar bancas
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: bancas, error } = await supabase
      .from('bancas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bancas }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar bancas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar banca
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

    // Verificar se sigla já existe
    const { data: existente } = await supabase
      .from('bancas')
      .select('id')
      .eq('sigla', bancaData.sigla)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma banca com esta sigla' },
        { status: 409 }
      );
    }

    const { data: banca, error } = await supabase
      .from('bancas')
      .insert(bancaData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Banca criada com sucesso', banca },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar banca:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
