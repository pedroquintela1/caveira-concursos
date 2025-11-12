import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT - Atualizar artigo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('artigos')
      .update({
        lei_id: parseInt(body.lei_id),
        numero: body.numero,
        titulo: body.titulo || null,
        texto_completo: body.texto_completo,
        texto_formatado: body.texto_formatado || null,
        capitulo: body.capitulo || null,
        secao: body.secao || null,
        is_muito_cobrado: body.is_muito_cobrado || false,
        peso_edital: body.peso_edital || 1,
        ordem: body.ordem || 0,
        palavras_chave: body.palavras_chave || [],
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ artigo: data }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao atualizar artigo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar artigo' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar artigo
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('artigos')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao deletar artigo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar artigo' },
      { status: 500 }
    );
  }
}
