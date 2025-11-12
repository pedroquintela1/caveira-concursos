import { createClient } from '@/lib/supabase/server';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StreakCard } from '@/components/dashboard/streak-card';
import { NextQuestionsCard } from '@/components/dashboard/next-questions-card';
import { getDisplayName } from '@/lib/utils/get-display-name';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar perfil do usuário para pegar nome personalizado
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome_exibicao, nome_completo, email')
    .eq('id', user?.id)
    .single();

  // Buscar estatísticas do usuário
  const { data: stats } = await supabase
    .from('estatisticas_usuarios')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  // Buscar últimas respostas
  const { data: recentAnswers } = await supabase
    .from('respostas_usuarios')
    .select('*, questoes(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Obter nome de exibição com prioridade
  const displayName = getDisplayName(profile || {});

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-saira text-4xl font-bold text-white">
          Olá, {displayName}!
        </h1>
        <p className="mt-2 text-gray-400">
          Pronto para dominar a Lei Seca hoje?
        </p>
      </div>

      {/* Stats Cards Grid */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Performance Chart */}
          <PerformanceChart userId={user?.id} />

          {/* Recent Activity */}
          <RecentActivity activities={recentAnswers} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Streak Card */}
          <StreakCard streak={stats?.streak_atual || 0} />

          {/* Next Questions */}
          <NextQuestionsCard />
        </div>
      </div>
    </div>
  );
}
