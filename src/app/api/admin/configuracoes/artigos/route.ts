import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Listar todos os artigos
export async function GET() {
  try {
    const supabase = createClient();

    const { data: artigos, error } = await supabase
      .from('artigos')
      .select(`
        *,
        lei:leis(id, nome, nome_curto, sigla, disciplina_id, disciplinas(id, nome, slug))
      `)
      .order('lei_id', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ artigos }, { status: 200 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao buscar artigos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar artigos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo artigo
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('artigos')
      .insert({
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
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ artigo: data }, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN] Erro ao criar artigo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar artigo' },
      { status: 500 }
    );
  }
}
