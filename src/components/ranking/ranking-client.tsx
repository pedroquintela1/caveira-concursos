'use client';

import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RankingUser {
  id: string;
  nome: string;
  pontos_totais: number;
  nivel: number;
}

interface UserProfile extends RankingUser {
  plano: 'free' | 'basic' | 'premium';
  posicao: number;
}

interface RankingClientProps {
  rankingGeral: RankingUser[];
  userProfile: UserProfile;
  disciplinas: { id: string; nome: string }[];
  bancas: { id: string; nome: string }[];
}

export function RankingClient({
  rankingGeral: initialRanking,
  userProfile,
  disciplinas,
  bancas,
}: RankingClientProps) {
  const [ranking, setRanking] = useState(initialRanking);
  const [filtroTipo, setFiltroTipo] = useState<
    'geral' | 'disciplina' | 'banca'
  >('geral');
  const [filtroId, setFiltroId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const aplicarFiltro = async () => {
    if (filtroTipo === 'geral') {
      setRanking(initialRanking);
      return;
    }

    setIsLoading(true);

    try {
      const url = `/api/ranking?tipo=${filtroTipo}&id=${filtroId}`;
      const response = await fetch(url);
      const data = await response.json();
      setRanking(data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPosicaoIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getPosicaoColor = (index: number) => {
    if (index === 0) return 'border-yellow-400/50 bg-yellow-400/10';
    if (index === 1) return 'border-gray-400/50 bg-gray-400/10';
    if (index === 2) return 'border-amber-600/50 bg-amber-600/10';
    return 'border-gray-800 bg-gray-900/50';
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-saira text-3xl font-bold text-white">Ranking</h1>
        <p className="mt-1 text-sm text-gray-400">
          Compare seu desempenho com outros estudantes
        </p>
      </div>

      {/* User Position Card */}
      <Card className="mb-6 border-[#8fbc8f]/50 bg-gradient-to-r from-[#8fbc8f]/20 to-[#8fbc8f]/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8fbc8f]/20">
              <Trophy className="h-8 w-8 text-[#8fbc8f]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Sua Posição</p>
              <p className="font-saira text-3xl font-bold text-white">
                #{userProfile.posicao}
              </p>
              <p className="text-sm text-gray-400">{userProfile.nome}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Pontos</p>
            <p className="font-saira text-2xl font-bold text-white">
              {userProfile.pontos_totais.toLocaleString()}
            </p>
            <Badge className="mt-2 bg-[#8fbc8f]/20 text-[#8fbc8f]">
              Nível {userProfile.nivel}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="mb-6 border-gray-800 bg-gray-900/50 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm text-gray-400">Filtrar por</label>
            <Select
              value={filtroTipo}
              onValueChange={(value: any) => {
                setFiltroTipo(value);
                setFiltroId('');
              }}
            >
              <SelectTrigger className="border-gray-800 bg-gray-950 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Ranking Geral</SelectItem>
                <SelectItem value="disciplina">Por Disciplina</SelectItem>
                <SelectItem value="banca">Por Banca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtroTipo === 'disciplina' && (
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm text-gray-400">
                Disciplina
              </label>
              <Select value={filtroId} onValueChange={setFiltroId}>
                <SelectTrigger className="border-gray-800 bg-gray-950 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filtroTipo === 'banca' && (
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm text-gray-400">Banca</label>
              <Select value={filtroId} onValueChange={setFiltroId}>
                <SelectTrigger className="border-gray-800 bg-gray-950 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {bancas.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={aplicarFiltro}
            disabled={isLoading || (filtroTipo !== 'geral' && !filtroId)}
            className="bg-[#8fbc8f] hover:bg-[#7da87d]"
          >
            <Filter className="mr-2 h-4 w-4" />
            {isLoading ? 'Carregando...' : 'Aplicar'}
          </Button>
        </div>
      </Card>

      {/* Ranking List */}
      <div className="space-y-3">
        {ranking.map((user, index) => {
          const isCurrentUser = user.id === userProfile.id;

          return (
            <Card
              key={user.id}
              className={`p-4 transition-all ${getPosicaoColor(index)} ${
                isCurrentUser ? 'ring-2 ring-[#8fbc8f]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Posição */}
                <div className="flex w-12 items-center justify-center">
                  {getPosicaoIcon(index) || (
                    <span className="font-saira text-xl font-bold text-gray-500">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Nome */}
                <div className="flex-1">
                  <p className={`font-semibold ${isCurrentUser ? 'text-[#8fbc8f]' : 'text-white'}`}>
                    {user.nome}
                    {isCurrentUser && (
                      <Badge className="ml-2 bg-[#8fbc8f]/20 text-[#8fbc8f]">
                        Você
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">Nível {user.nivel}</p>
                </div>

                {/* Pontos */}
                <div className="text-right">
                  <p className="font-saira text-lg font-bold text-white">
                    {user.pontos_totais.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">pontos</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {ranking.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 font-saira text-lg font-semibold text-gray-400">
            Nenhum resultado encontrado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tente alterar os filtros
          </p>
        </div>
      )}
    </>
  );
}
