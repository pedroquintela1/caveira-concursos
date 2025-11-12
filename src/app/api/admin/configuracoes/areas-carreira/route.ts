import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Listar todas as áreas de carreira
export async function GET() {
  try {
    const supabase = createClient();

    const { data: areas, error } = await supabase
      .from('areas_carreira')
      .select('*')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ areas }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao buscar áreas de carreira:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar áreas de carreira' },
      { status: 500 }
    );
  }
}

// POST - Criar nova área de carreira
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('areas_carreira')
      .insert({
        nome: body.nome,
        slug: body.slug,
        descricao: body.descricao || null,
        ordem: body.ordem || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ area: data }, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao criar área de carreira:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar área de carreira' },
      { status: 500 }
    );
  }
}
