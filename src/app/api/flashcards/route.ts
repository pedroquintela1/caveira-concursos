import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const LIMITES = {
  free: { max_flashcards: 30 },
  basic: { max_flashcards: 200 },
  premium: { max_flashcards: Infinity },
};

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single();

    const plano = (profile?.plano || 'free') as 'free' | 'basic' | 'premium';

    const { count } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const limite = LIMITES[plano];

    if (count && count >= limite.max_flashcards) {
      return NextResponse.json(
        {
          error: `Limite de ${limite.max_flashcards} flashcards atingido para o plano ${plano}`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Próxima revisão: hoje (flashcard novo)
    const hoje = new Date();

    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: user.id,
        frente: body.frente,
        verso: body.verso,
        disciplina: body.disciplina || null,
        tags: body.tags || [],
        proxima_revisao: hoje.toISOString(),
        intervalo_dias: 1,
        facilidade: 2.5,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
      .order('proxima_revisao', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
