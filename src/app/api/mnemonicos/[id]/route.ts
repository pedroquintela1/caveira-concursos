import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o mnemônico pertence ao usuário
    const { data: mnemonico } = await supabase
      .from('mnemonicos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!mnemonico) {
      return NextResponse.json(
        { error: 'Mnemônico não encontrado' },
        { status: 404 }
      );
    }

    if (mnemonico.user_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { error } = await supabase
      .from('mnemonicos')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar mnemônico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
