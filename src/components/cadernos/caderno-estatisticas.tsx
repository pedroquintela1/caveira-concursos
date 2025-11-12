'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface CadernoEstatisticasProps {
  cadernoId: number;
}

export function CadernoEstatisticas({ cadernoId }: CadernoEstatisticasProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchEstatisticas();
  }, [cadernoId]);

  const fetchEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cadernos/${cadernoId}/estatisticas`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar estatísticas');
      }

      setStats(data.estatisticas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8fbc8f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={fetchEstatisticas}
          className="mt-4 bg-[#8fbc8f] text-gray-900 hover:bg-[#7aa87a]"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center text-gray-400">
        Estatísticas não disponíveis.
      </div>
    );
  }

  // Dados para gráfico de pizza (desempenho geral)
  const pieData = [
    { name: 'Acertos', value: stats.geral.acertos, color: '#10b981' },
    { name: 'Erros', value: stats.geral.erros, color: '#ef4444' },
    {
      name: 'Não Resolvidas',
      value: stats.geral.nao_resolvidas,
      color: '#6b7280',
    },
  ];

  // Dados para gráfico de barras (desempenho por disciplina)
  const barData = stats.desempenho_por_disciplina
    .slice(0, 5)
    .map((disc: any) => ({
      disciplina:
        disc.disciplina_nome.length > 15
          ? disc.disciplina_nome.substring(0, 15) + '...'
          : disc.disciplina_nome,
      acertos: disc.acertos,
      erros: disc.erros,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Estatísticas Detalhadas
        </h2>
        <p className="text-sm text-gray-400">
          Análise completa do seu desempenho neste caderno
        </p>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total de Questões */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.geral.total_questoes}
          </p>
          <p className="mt-1 text-xs text-gray-500">Questões</p>
        </div>

        {/* Resolvidas */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span className="text-xs text-gray-400">Progresso</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.geral.percentual_completo}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.geral.questoes_resolvidas} resolvidas
          </p>
        </div>

        {/* Taxa de Acerto */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs text-gray-400">Acerto</span>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {stats.geral.taxa_acerto}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.geral.acertos} acertos
          </p>
        </div>

        {/* Tempo Total */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <Clock className="h-5 w-5 text-[#8fbc8f]" />
            <span className="text-xs text-gray-400">Tempo</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.tempo.total_formatado}
          </p>
          <p className="mt-1 text-xs text-gray-500">Total gasto</p>
        </div>
      </div>

      {/* Informações de Tempo Detalhadas */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Clock className="h-5 w-5 text-[#8fbc8f]" />
          Análise de Tempo
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="mb-1 text-sm text-gray-400">
              Tempo Médio por Questão
            </p>
            <p className="text-xl font-bold text-white">
              {stats.tempo.medio_formatado}
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Tempo Mínimo</p>
            <p className="text-xl font-bold text-blue-500">
              {stats.tempo.minimo_formatado}
            </p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Tempo Máximo</p>
            <p className="text-xl font-bold text-orange-500">
              {stats.tempo.maximo_formatado}
            </p>
          </div>
        </div>
        {stats.ultima_sessao && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              Última sessão:{' '}
              <span className="font-medium text-white">
                {new Date(stats.ultima_sessao).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Pizza - Distribuição Geral */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Distribuição de Respostas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '2px solid #8fbc8f',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry: any) => (
                  <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                    {value}: {entry.payload.value} (
                    {(
                      (entry.payload.value /
                        pieData.reduce((a, b) => a + b.value, 0)) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Desempenho por Disciplina */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Top 5 Disciplinas
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis
                  dataKey="disciplina"
                  stroke="#d1d5db"
                  fontSize={12}
                  tick={{ fill: '#d1d5db' }}
                />
                <YAxis
                  stroke="#d1d5db"
                  fontSize={12}
                  tick={{ fill: '#d1d5db' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '2px solid #8fbc8f',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  }}
                  labelStyle={{ color: '#e5e7eb', fontWeight: '600', marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="square"
                  formatter={(value) => (
                    <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey="acertos" fill="#10b981" name="Acertos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="erros" fill="#ef4444" name="Erros" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">
              Resolva questões para ver o gráfico
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Desempenho por Disciplina */}
      {stats.desempenho_por_disciplina.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50">
          <div className="border-b border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white">
              Desempenho por Disciplina
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                    Acertos
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                    Erros
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                    Taxa
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                    Tempo Médio
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.desempenho_por_disciplina.map((disc: any) => (
                  <tr
                    key={disc.disciplina_id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-900"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {disc.disciplina_nome}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                      {disc.total}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-green-500">
                      {disc.acertos}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-red-500">
                      {disc.erros}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span
                        className={`font-semibold ${
                          disc.taxa_acerto >= 70
                            ? 'text-green-500'
                            : disc.taxa_acerto >= 50
                              ? 'text-yellow-500'
                              : 'text-red-500'
                        }`}
                      >
                        {disc.taxa_acerto}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                      {Math.floor(disc.tempo_medio / 60)}m{' '}
                      {disc.tempo_medio % 60}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600 disabled:bg-gray-800/50 disabled:text-gray-500"
          disabled
        >
          Criar Caderno com Erradas
        </Button>
        <Button
          variant="outline"
          className="border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600 disabled:bg-gray-800/50 disabled:text-gray-500"
          disabled
        >
          Criar Caderno com Resolvidas
        </Button>
      </div>
    </div>
  );
}
