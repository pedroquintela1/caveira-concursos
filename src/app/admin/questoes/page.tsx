'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Questao {
  id: number;
  enunciado: string;
  gabarito: string;
  ano: number;
  is_active: boolean;
  dificuldade: string | null;
  total_respostas: number;
  taxa_acerto: number;
  bancas: { id: number; nome: string; sigla: string };
  orgaos: { id: number; nome: string; sigla: string } | null;
  disciplinas: { id: number; nome: string; slug: string };
  questoes_assuntos?: Array<{
    assunto_id: number;
    assuntos: { id: number; nome: string; nivel: number };
  }>;
  created_at: string;
}

export default function QuestoesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    busca: '',
    disciplina_id: '',
    banca_id: '',
    orgao_id: '',
    ano: '',
    dificuldade: '',
  });

  // Buscar filtros (disciplinas, bancas, órgãos)
  const { data: disciplinas } = useQuery({
    queryKey: ['admin-disciplinas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/disciplinas');
      const json = await res.json();
      return json.disciplinas;
    },
  });

  const { data: bancas } = useQuery({
    queryKey: ['admin-bancas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/bancas');
      const json = await res.json();
      return json.bancas;
    },
  });

  const { data: orgaos } = useQuery({
    queryKey: ['admin-orgaos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/orgaos');
      const json = await res.json();
      return json.orgaos;
    },
  });

  // Buscar questões
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-questoes', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const res = await fetch(`/api/admin/questoes?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar questões');
      return res.json();
    },
  });

  // Deletar questão
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/questoes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar questão');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questoes'] });
      toast.success('Questão desativada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset para página 1 ao filtrar
  };

  const clearFilters = () => {
    setFilters({
      busca: '',
      disciplina_id: '',
      banca_id: '',
      orgao_id: '',
      ano: '',
      dificuldade: '',
    });
    setPage(1);
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Questões</h1>
          <p className="mt-2 text-gray-400">Gerencie o banco de questões</p>
        </div>
        <Link href="/admin/questoes/nova">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nova Questão
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="border-gray-800 bg-gray-950 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Input
              placeholder="Buscar no enunciado..."
              value={filters.busca}
              onChange={(e) => handleFilterChange('busca', e.target.value)}
              className="w-full"
            />
          </div>

          <Select
            value={filters.disciplina_id}
            onValueChange={(value) =>
              handleFilterChange('disciplina_id', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {disciplinas?.map((d: any) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.banca_id}
            onValueChange={(value) =>
              handleFilterChange('banca_id', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Banca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {bancas?.map((b: any) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.sigla}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Ano"
            value={filters.ano}
            onChange={(e) => handleFilterChange('ano', e.target.value)}
            min={2000}
            max={2030}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Limpar
            </Button>
            <Button onClick={() => refetch()} className="flex-1">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="border-gray-800 bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="w-12 p-4 text-left font-medium text-gray-400">
                  ID
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Enunciado
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Assuntos
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Banca
                </th>
                <th className="p-4 text-left font-medium text-gray-400">Ano</th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Gabarito
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Taxa
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Status
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data?.questoes && data.questoes.length > 0 ? (
                data.questoes.map((questao: Questao) => (
                  <tr
                    key={questao.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="p-4 text-gray-300">{questao.id}</td>
                    <td className="max-w-md p-4 text-white">
                      {truncate(questao.enunciado, 100)}
                    </td>
                    <td className="p-4">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {questao.questoes_assuntos &&
                        questao.questoes_assuntos.length > 0 ? (
                          questao.questoes_assuntos.slice(0, 2).map((qa) => (
                            <span
                              key={qa.assunto_id}
                              className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400"
                              title={qa.assuntos.nome}
                            >
                              {truncate(qa.assuntos.nome, 20)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                        {questao.questoes_assuntos &&
                          questao.questoes_assuntos.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{questao.questoes_assuntos.length - 2}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                        {questao.bancas.sigla}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{questao.ano}</td>
                    <td className="p-4">
                      <span className="rounded bg-emerald-500/20 px-2 py-1 text-sm font-bold text-emerald-400">
                        {questao.gabarito}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {questao.taxa_acerto
                        ? `${questao.taxa_acerto.toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="p-4">
                      {questao.is_active ? (
                        <span className="text-sm text-emerald-500">Ativa</span>
                      ) : (
                        <span className="text-sm text-gray-500">Inativa</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/questoes/${questao.id}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-500 hover:text-blue-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Desativar esta questão?')) {
                              deleteMutation.mutate(questao.id);
                            }
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Nenhuma questão encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 p-4">
            <p className="text-sm text-gray-400">
              Mostrando {data.questoes.length} de {data.pagination.total}{' '}
              questões
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                Anterior
              </Button>
              <span className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm font-medium text-white">
                Página {page} de {data.pagination.pages}
              </span>
              <Button
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.pages, p + 1))
                }
                disabled={page === data.pagination.pages}
                className="bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
