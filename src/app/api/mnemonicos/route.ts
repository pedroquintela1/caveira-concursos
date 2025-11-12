import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const LIMITES = {
  free: { max_mnemonicos: 10 },
  basic: { max_mnemonicos: 50 },
  premium: { max_mnemonicos: Infinity },
};

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar plano do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', user.id)
      .single();

    const plano = (profile?.plano || 'free') as 'free' | 'basic' | 'premium';

    // Contar mnemônicos existentes
    const { count } = await supabase
      .from('mnemonicos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const limite = LIMITES[plano];

    if (count && count >= limite.max_mnemonicos) {
      return NextResponse.json(
        {
          error: `Limite de ${limite.max_mnemonicos} mnemônicos atingido para o plano ${plano}`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data: mnemonico, error } = await supabase
      .from('mnemonicos')
      .insert({
        user_id: user.id,
        titulo: body.titulo,
        conteudo: body.conteudo,
        lei: body.lei,
        artigo: body.artigo || null,
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mnemonico);
  } catch (error) {
    console.error('Erro ao criar mnemônico:', error);
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

    const { data: mnemonicos, error } = await supabase
      .from('mnemonicos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mnemonicos);
  } catch (error) {
    console.error('Erro ao buscar mnemônicos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
