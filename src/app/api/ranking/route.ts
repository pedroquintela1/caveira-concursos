import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'geral';
    const id = searchParams.get('id');

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (tipo === 'geral') {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, pontos_totais, nivel')
        .order('pontos_totais', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Para rankings filtrados, precisaríamos de agregações mais complexas
    // Por enquanto, retornar ranking geral
    // TODO: Implementar rankings por disciplina e banca com queries específicas

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, pontos_totais, nivel')
      .order('pontos_totais', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
