import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BancasClient } from '@/components/bancas/bancas-client';

export const metadata = {
  title: 'Análise de Bancas | KAV Concursos',
  description: 'Inteligência sobre bancas examinadoras',
};

export default async function BancasPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar todas as bancas
  const { data: bancas } = await supabase
    .from('bancas')
    .select('*')
    .order('nome');

  // Buscar estatísticas do usuário por banca
  const { data: respostas } = await supabase
    .from('respostas_usuarios')
    .select(
      `
      correta,
      questao:questoes (
        banca_id,
        disciplina_id
      )
    `
    )
    .eq('user_id', user.id);

  // Processar estatísticas
  const estatisticasPorBanca = bancas?.map((banca) => {
    const respostasBanca = respostas?.filter(
      (r: any) => r.questao?.banca_id === banca.id
    );

    const total = respostasBanca?.length || 0;
    const acertos = respostasBanca?.filter((r: any) => r.correta).length || 0;
    const taxaAcerto = total > 0 ? (acertos / total) * 100 : 0;

    return {
      ...banca,
      total_respondidas: total,
      total_acertos: acertos,
      taxa_acerto: taxaAcerto,
    };
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BancasClient estatisticas={estatisticasPorBanca || []} />
      </div>
    </div>
  );
}
