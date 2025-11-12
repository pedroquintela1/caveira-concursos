import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT - Atualizar formação
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('formacoes')
      .update({
        nome: body.nome,
        slug: body.slug,
        area_conhecimento: body.area_conhecimento || null,
        ordem: body.ordem || 0,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ formacao: data }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao atualizar formação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar formação' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar formação
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('formacoes')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao deletar formação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar formação' },
      { status: 500 }
    );
  }
}
