import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Algoritmo SM-2 simplificado para calcular próxima revisão
function calcularProximaRevisao(
  qualidade: number,
  intervalo_atual: number,
  facilidade_atual: number
): { novoIntervalo: number; novaFacilidade: number; proximaRevisao: string } {
  // Atualizar facilidade (entre 1.3 e 2.5)
  let novaFacilidade = facilidade_atual + (0.1 - (3 - qualidade) * (0.08 + (3 - qualidade) * 0.02));

  if (novaFacilidade < 1.3) novaFacilidade = 1.3;
  if (novaFacilidade > 2.5) novaFacilidade = 2.5;

  // Calcular novo intervalo
  let novoIntervalo: number;

  if (qualidade < 2) {
    // Não lembrou ou difícil: resetar para 1 dia
    novoIntervalo = 1;
  } else if (intervalo_atual === 1) {
    // Primeira revisão bem-sucedida: 6 dias
    novoIntervalo = 6;
  } else {
    // Aumentar intervalo baseado na facilidade
    novoIntervalo = Math.round(intervalo_atual * novaFacilidade);
  }

  // Calcular data da próxima revisão
  const proximaData = new Date();
  proximaData.setDate(proximaData.getDate() + novoIntervalo);

  return {
    novoIntervalo,
    novaFacilidade,
    proximaRevisao: proximaData.toISOString(),
  };
}

export async function POST(
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

    // Buscar flashcard
    const { data: flashcard } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado' },
        { status: 404 }
      );
    }

    if (flashcard.user_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const qualidade = body.qualidade; // 0, 1, 2, 3

    // Calcular próxima revisão usando SM-2
    const { novoIntervalo, novaFacilidade, proximaRevisao } =
      calcularProximaRevisao(
        qualidade,
        flashcard.intervalo_dias,
        flashcard.facilidade
      );

    // Atualizar flashcard
    const { data: updated, error } = await supabase
      .from('flashcards')
      .update({
        intervalo_dias: novoIntervalo,
        facilidade: novaFacilidade,
        proxima_revisao: proximaRevisao,
        ultima_revisao: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao registrar revisão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
