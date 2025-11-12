import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Listar todas as leis
export async function GET() {
  try {
    const supabase = createClient();

    const { data: leis, error } = await supabase
      .from('leis')
      .select(`
        *,
        disciplina:disciplinas(id, nome, slug)
      `)
      .order('ordem', { ascending: true })
      .order('nome_curto', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ leis }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao buscar leis:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar leis' },
      { status: 500 }
    );
  }
}

// POST - Criar nova lei
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('leis')
      .insert({
        disciplina_id: parseInt(body.disciplina_id),
        nome: body.nome,
        nome_curto: body.nome_curto,
        sigla: body.sigla || null,
        numero_lei: body.numero_lei || null,
        ementa: body.ementa || null,
        data_publicacao: body.data_publicacao || null,
        link_oficial: body.link_oficial || null,
        total_artigos: body.total_artigos || 0,
        ordem: body.ordem || 0,
        is_mais_cobrada: body.is_mais_cobrada || false,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lei: data }, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao criar lei:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar lei' },
      { status: 500 }
    );
  }
}
