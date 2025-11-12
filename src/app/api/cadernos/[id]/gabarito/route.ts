import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type GabaritoItem = {
  numero: number;
  questao_id: number;
  codigo: string;
  gabarito_oficial: string;
  resposta_usuario: string | null;
  status: 'acertou' | 'errou' | 'nao_resolvida';
  resolvida_em: string | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[GABARITO] Erro de autenticação:', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const cadernoId = parseInt(params.id, 10);
    if (isNaN(cadernoId)) {
      console.error('[GABARITO] ID inválido:', params.id);
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    console.log(
      '[GABARITO] Buscando questões do caderno:',
      cadernoId,
      'para usuário:',
      user.id
    );

    // Buscar questões do caderno via RPC
    const { data: questoes, error: rpcError } = await supabase.rpc(
      'get_caderno_questoes',
      { p_caderno_id: cadernoId, p_user_id: user.id }
    );

    if (rpcError) {
      console.error('[GABARITO] Erro ao chamar RPC:', rpcError);
      return NextResponse.json(
        {
          error: 'Erro ao buscar questões',
          details: rpcError.message,
        },
        { status: 500 }
      );
    }

    console.log('[GABARITO] Questões encontradas:', questoes?.length || 0);

    // Montar gabarito
    const gabarito: GabaritoItem[] =
      questoes?.map((q: any, index: number) => {
        const jaRespondida = q.ja_respondida === true;
        const respondeuCorretamente = q.respondeu_corretamente === true;

        return {
          numero: index + 1,
          questao_id: q.id,
          codigo: q.codigo || null,
          gabarito_oficial: q.gabarito || q.gabarito_oficial,
          resposta_usuario: q.resposta_usuario || null,
          status: jaRespondida
            ? respondeuCorretamente
              ? 'acertou'
              : 'errou'
            : 'nao_resolvida',
          resolvida_em: q.respondida_em || null,
        };
      }) || [];

    // Estatísticas do gabarito
    const total = gabarito.length;
    const resolvidas = gabarito.filter(
      (item: GabaritoItem) => item.status !== 'nao_resolvida'
    ).length;
    const acertos = gabarito.filter(
      (item: GabaritoItem) => item.status === 'acertou'
    ).length;
    const erros = gabarito.filter(
      (item: GabaritoItem) => item.status === 'errou'
    ).length;
    const taxaAcerto =
      resolvidas > 0 ? ((acertos / resolvidas) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      gabarito,
      stats: {
        total,
        resolvidas,
        acertos,
        erros,
        taxa_acerto: parseFloat(taxaAcerto),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar gabarito:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
