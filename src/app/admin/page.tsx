import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, FileQuestion, Lightbulb, MessageSquare } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Buscar métricas básicas
  const [
    { count: totalUsuarios },
    { count: totalQuestoes },
    { count: totalMnemonicos },
    { count: totalComentarios },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('questoes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('mnemonicos').select('*', { count: 'exact', head: true }),
    supabase.from('questoes_comentarios').select('*', { count: 'exact', head: true }),
  ]);

  // Buscar usuários por plano
  const { data: usuariosPorPlano } = await supabase
    .from('profiles')
    .select('plano');

  const free = usuariosPorPlano?.filter((u) => u.plano === 'free').length || 0;
  const basic = usuariosPorPlano?.filter((u) => u.plano === 'basic').length || 0;
  const premium = usuariosPorPlano?.filter((u) => u.plano === 'premium').length || 0;

  // Calcular MRR estimado (basic = R$39,90, premium = R$79,90)
  const mrr = (basic * 39.9 + premium * 79.9).toFixed(2);

  // Buscar conteúdo pendente de moderação
  const { count: mnemonicosPendentes } = await supabase
    .from('mnemonicos')
    .select('*', { count: 'exact', head: true })
    .eq('is_validado', false);

  const cards = [
    {
      title: 'Total de Usuários',
      value: totalUsuarios || 0,
      subtitle: `${free} Free | ${basic} Basic | ${premium} Premium`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'MRR (Receita Mensal)',
      value: `R$ ${mrr}`,
      subtitle: `${basic + premium} assinantes pagos`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Questões Ativas',
      value: totalQuestoes || 0,
      subtitle: 'Disponíveis para estudo',
      icon: FileQuestion,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Mnemônicos',
      value: totalMnemonicos || 0,
      subtitle: `${mnemonicosPendentes || 0} aguardando moderação`,
      icon: Lightbulb,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Comentários',
      value: totalComentarios || 0,
      subtitle: 'Total na plataforma',
      icon: MessageSquare,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Taxa de Conversão',
      value: totalUsuarios ? `${(((basic + premium) / totalUsuarios) * 100).toFixed(1)}%` : '0%',
      subtitle: 'Free → Pago',
      icon: TrendingUp,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Visão geral da plataforma KAV Concursos</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="bg-gray-950 border-gray-800 p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      {mnemonicosPendentes && mnemonicosPendentes > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-500">
                {mnemonicosPendentes} mnemônicos aguardando moderação
              </p>
              <p className="text-xs text-amber-500/70 mt-1">
                Acesse a seção de Mnemônicos para revisar e aprovar
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Próximas features */}
      <Card className="bg-gray-950 border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Próximas Implementações</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            Gráfico de crescimento de usuários (últimos 30 dias)
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            Estatísticas de churn mensal
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            Análise de engajamento por funcionalidade
          </li>
        </ul>
      </Card>
    </div>
  );
}
