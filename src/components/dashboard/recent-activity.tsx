'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Activity {
  id: number;
  created_at: string;
  resposta_escolhida: string;
  questoes: {
    id: number;
    enunciado: string;
    alternativa_correta: string;
  };
}

interface RecentActivityProps {
  activities?: Activity[] | null;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <p>Nenhuma atividade recente ainda.</p>
            <p className="mt-1 text-sm">
              Comece respondendo questões para ver seu progresso!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const isCorrect =
              activity.resposta_escolhida ===
              activity.questoes.alternativa_correta;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-800/30 p-3 transition-all hover:border-[#8fbc8f]/50 hover:bg-gray-800/50"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 rounded-full p-2 ${
                    isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {activity.questoes.enunciado.substring(0, 80)}...
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Result Badge */}
                <div
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    isCorrect
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {isCorrect ? 'Acertou' : 'Errou'}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
