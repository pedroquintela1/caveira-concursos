import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT - Atualizar lei
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('leis')
      .update({
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
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lei: data }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao atualizar lei:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar lei' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar lei
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('leis')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao deletar lei:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar lei' },
      { status: 500 }
    );
  }
}
