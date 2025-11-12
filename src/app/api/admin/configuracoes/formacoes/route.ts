import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Listar todas as formações
export async function GET() {
  try {
    const supabase = createClient();

    const { data: formacoes, error } = await supabase
      .from('formacoes')
      .select('*')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ formacoes }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao buscar formações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova formação
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('formacoes')
      .insert({
        nome: body.nome,
        slug: body.slug,
        area_conhecimento: body.area_conhecimento || null,
        ordem: body.ordem || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ formacao: data }, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao criar formação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar formação' },
      { status: 500 }
    );
  }
}
