import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Listar todos os assuntos
export async function GET() {
  try {
    const supabase = createClient();

    const { data: assuntos, error } = await supabase
      .from('assuntos')
      .select(
        `
        *,
        disciplina:disciplinas(id, nome, slug),
        parent:assuntos!parent_id(id, nome)
      `
      )
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ assuntos }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao buscar assuntos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assuntos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo assunto
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('assuntos')
      .insert({
        nome: body.nome,
        disciplina_id: parseInt(body.disciplina_id),
        parent_id: body.parent_id ? parseInt(body.parent_id) : null,
        nivel: body.nivel || 1,
        ordem: body.ordem || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ assunto: data }, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao criar assunto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar assunto' },
      { status: 500 }
    );
  }
}
