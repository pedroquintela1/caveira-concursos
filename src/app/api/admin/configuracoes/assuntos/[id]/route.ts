import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT - Atualizar assunto
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('assuntos')
      .update({
        nome: body.nome,
        disciplina_id: parseInt(body.disciplina_id),
        parent_id: body.parent_id ? parseInt(body.parent_id) : null,
        nivel: body.nivel || 1,
        ordem: body.ordem || 0,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ assunto: data }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao atualizar assunto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar assunto' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar assunto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('assuntos')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao deletar assunto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar assunto' },
      { status: 500 }
    );
  }
}
