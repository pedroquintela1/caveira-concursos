import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RankingClient } from '@/components/ranking/ranking-client';

export const metadata = {
  title: 'Ranking | KAV Concursos',
  description: 'Veja sua posição e compare seu desempenho',
};

export default async function RankingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar perfil do usuário
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('nome, pontos_totais, nivel, plano')
    .eq('id', user.id)
    .single();

  // Buscar top 100 usuários por pontos
  const { data: rankingGeral } = await supabase
    .from('profiles')
    .select('id, nome, pontos_totais, nivel')
    .order('pontos_totais', { ascending: false })
    .limit(100);

  // Buscar posição do usuário
  const { count: posicao } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('pontos_totais', userProfile?.pontos_totais || 0);

  // Buscar disciplinas para filtros
  const { data: disciplinas } = await supabase
    .from('disciplinas')
    .select('id, nome')
    .order('nome');

  // Buscar bancas para filtros
  const { data: bancas } = await supabase
    .from('bancas')
    .select('id, nome')
    .order('nome');

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RankingClient
          rankingGeral={rankingGeral || []}
          userProfile={{
            id: user.id,
            nome: userProfile?.nome || 'Usuário',
            pontos_totais: userProfile?.pontos_totais || 0,
            nivel: userProfile?.nivel || 1,
            plano: userProfile?.plano || 'free',
            posicao: (posicao || 0) + 1,
          }}
          disciplinas={disciplinas || []}
          bancas={bancas || []}
        />
      </div>
    </div>
  );
}
