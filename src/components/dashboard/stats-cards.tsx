import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle2, Target, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    total_questoes_respondidas: number;
    questoes_corretas: number;
    taxa_acerto: number;
    pontos_totais: number;
  } | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Questões Respondidas',
      value: stats?.total_questoes_respondidas || 0,
      icon: BookOpen,
      color: 'text-[#8fbc8f]',
      bgColor: 'bg-[#8fbc8f]/20',
    },
    {
      title: 'Questões Corretas',
      value: stats?.questoes_corretas || 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
    },
    {
      title: 'Taxa de Acerto',
      value: `${stats?.taxa_acerto || 0}%`,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
    },
    {
      title: 'Pontos Totais',
      value: stats?.pontos_totais || 0,
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-all hover:scale-105 hover:border-[#8fbc8f]/50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} rounded-lg p-2`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-saira text-3xl font-bold text-white">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                +12% vs. semana passada
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
