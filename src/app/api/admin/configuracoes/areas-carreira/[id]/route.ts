import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT - Atualizar área de carreira
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('areas_carreira')
      .update({
        nome: body.nome,
        slug: body.slug,
        descricao: body.descricao || null,
        ordem: body.ordem || 0,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ area: data }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao atualizar área de carreira:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar área de carreira' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar área de carreira
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('areas_carreira')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao deletar área de carreira:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar área de carreira' },
      { status: 500 }
    );
  }
}
