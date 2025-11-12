'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface BancaEstatistica {
  id: string;
  nome: string;
  sigla: string;
  total_respondidas: number;
  total_acertos: number;
  taxa_acerto: number;
}

interface BancasClientProps {
  estatisticas: BancaEstatistica[];
}

export function BancasClient({ estatisticas }: BancasClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBancas = estatisticas.filter(
    (b) =>
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sigla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar por mais respondidas
  const bancasMaisRespondidas = [...filteredBancas].sort(
    (a, b) => b.total_respondidas - a.total_respondidas
  );

  // Bancas com melhor desempenho
  const bancasMelhorDesempenho = [...filteredBancas]
    .filter((b) => b.total_respondidas >= 5)
    .sort((a, b) => b.taxa_acerto - a.taxa_acerto)
    .slice(0, 5);

  // Bancas que precisam de mais atenção
  const bancasAtencao = [...filteredBancas]
    .filter((b) => b.total_respondidas >= 5 && b.taxa_acerto < 60)
    .sort((a, b) => a.taxa_acerto - b.taxa_acerto)
    .slice(0, 5);

  const getTaxaColor = (taxa: number) => {
    if (taxa >= 80) return 'text-green-400';
    if (taxa >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTaxaBgColor = (taxa: number) => {
    if (taxa >= 80) return 'bg-green-500';
    if (taxa >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-saira text-3xl font-bold text-white">
          Análise de Bancas
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Inteligência sobre seu desempenho em cada banca examinadora
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#8fbc8f]/20 p-2">
              <TrendingUp className="h-5 w-5 text-[#8fbc8f]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bancas Estudadas</p>
              <p className="font-saira text-2xl font-bold text-white">
                {estatisticas.filter((b) => b.total_respondidas > 0).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Award className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Melhor Desempenho</p>
              <p className="font-saira text-2xl font-bold text-white">
                {bancasMelhorDesempenho[0]?.sigla || '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Precisa de Atenção</p>
              <p className="font-saira text-2xl font-bold text-white">
                {bancasAtencao.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights */}
      {bancasMelhorDesempenho.length > 0 && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5 p-5">
          <div className="flex items-start gap-3">
            <Award className="mt-1 h-5 w-5 text-green-400" />
            <div>
              <h3 className="font-semibold text-green-400">
                Parabéns pelo desempenho!
              </h3>
              <p className="mt-1 text-sm text-gray-300">
                Você está indo muito bem em{' '}
                <strong>{bancasMelhorDesempenho[0].nome}</strong> com{' '}
                {bancasMelhorDesempenho[0].taxa_acerto.toFixed(1)}% de acerto!
              </p>
            </div>
          </div>
        </Card>
      )}

      {bancasAtencao.length > 0 && (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 text-orange-400" />
            <div>
              <h3 className="font-semibold text-orange-400">
                Áreas para melhorar
              </h3>
              <p className="mt-1 text-sm text-gray-300">
                Foque mais em <strong>{bancasAtencao[0].nome}</strong> - sua
                taxa de acerto está em{' '}
                {bancasAtencao[0].taxa_acerto.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar bancas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-800 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Lista de Bancas */}
      <div className="space-y-3">
        {bancasMaisRespondidas.map((banca) => (
          <Card
            key={banca.id}
            className="border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-[#8fbc8f]/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="font-saira text-lg font-bold text-white">
                    {banca.nome}
                  </h3>
                  <Badge className="bg-gray-800 text-gray-400">
                    {banca.sigla}
                  </Badge>
                </div>

                <div className="mb-3 flex gap-6 text-sm text-gray-400">
                  <div>
                    <span className="text-white font-semibold">
                      {banca.total_respondidas}
                    </span>{' '}
                    questões
                  </div>
                  <div>
                    <span className="text-white font-semibold">
                      {banca.total_acertos}
                    </span>{' '}
                    acertos
                  </div>
                </div>

                {banca.total_respondidas > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Taxa de acerto
                      </span>
                      <span
                        className={`text-sm font-bold ${getTaxaColor(
                          banca.taxa_acerto
                        )}`}
                      >
                        {banca.taxa_acerto.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={banca.taxa_acerto}
                      className="h-2 bg-gray-800"
                      indicatorClassName={getTaxaBgColor(banca.taxa_acerto)}
                    />
                  </div>
                )}

                {banca.total_respondidas === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhuma questão respondida ainda
                  </p>
                )}
              </div>

              <ChevronRight className="h-5 w-5 text-gray-600" />
            </div>
          </Card>
        ))}
      </div>

      {filteredBancas.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 font-saira text-lg font-semibold text-gray-400">
            Nenhuma banca encontrada
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tente buscar por outro termo
          </p>
        </div>
      )}
    </>
  );
}
