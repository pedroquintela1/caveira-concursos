'use client';

import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface IndiceItem {
  tipo: 'disciplina' | 'artigo';
  id: number | string;
  nome: string;
  questoes: number;
  percentual: number;
  children?: IndiceItem[];
}

interface CadernoIndiceProps {
  cadernoId: number;
}

export function CadernoIndice({ cadernoId }: CadernoIndiceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indice, setIndice] = useState<IndiceItem[]>([]);
  const [caderno, setCaderno] = useState<any>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(
    new Set()
  );

  useEffect(() => {
    fetchIndice();
  }, [cadernoId]);

  const fetchIndice = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cadernos/${cadernoId}/indice`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar índice');
      }

      setIndice(data.indice || []);
      setCaderno(data.caderno);

      // Expandir todos os itens por padrão
      const allIds = new Set<string | number>();
      data.indice?.forEach((item: IndiceItem) => {
        allIds.add(item.id);
      });
      setExpandedItems(allIds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string | number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string | number>();
    indice.forEach((item) => {
      allIds.add(item.id);
    });
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const exportarParaPlanilha = () => {
    try {
      // Preparar dados para a planilha
      const dadosPlanilha: any[] = [];

      // Adicionar cabeçalho do caderno
      dadosPlanilha.push(['ÍNDICE DO CADERNO']);
      dadosPlanilha.push(['Nome do Caderno:', caderno?.nome || '']);
      dadosPlanilha.push(['Total de Questões:', caderno?.total_questoes || 0]);
      dadosPlanilha.push([
        'Data de Exportação:',
        new Date().toLocaleDateString('pt-BR'),
      ]);
      dadosPlanilha.push([]); // Linha vazia

      // Adicionar cabeçalhos das colunas
      dadosPlanilha.push(['Disciplina', 'Artigo', 'Nº Questões', 'Percentual']);

      // Adicionar dados hierárquicos
      indice.forEach((disciplina) => {
        // Linha da disciplina
        dadosPlanilha.push([
          disciplina.nome,
          '',
          disciplina.questoes,
          `${disciplina.percentual.toFixed(2)}%`,
        ]);

        // Linhas dos artigos (se houver)
        if (disciplina.children && disciplina.children.length > 0) {
          disciplina.children.forEach((artigo) => {
            dadosPlanilha.push([
              '', // Vazio para disciplina
              `  ${artigo.nome}`, // Indentado para mostrar hierarquia
              artigo.questoes,
              `${artigo.percentual.toFixed(2)}%`,
            ]);
          });
        }

        // Linha vazia entre disciplinas
        dadosPlanilha.push([]);
      });

      // Adicionar resumo no final
      dadosPlanilha.push([]);
      dadosPlanilha.push(['RESUMO']);
      dadosPlanilha.push(['Total de Disciplinas:', indice.length]);
      dadosPlanilha.push([
        'Total de Artigos:',
        indice.reduce((sum, d) => sum + (d.children?.length || 0), 0),
      ]);
      dadosPlanilha.push(['Total de Questões:', caderno?.total_questoes || 0]);

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dadosPlanilha);

      // Definir largura das colunas
      ws['!cols'] = [
        { wch: 40 }, // Disciplina
        { wch: 60 }, // Artigo
        { wch: 15 }, // Nº Questões
        { wch: 15 }, // Percentual
      ];

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Índice');

      // Gerar nome do arquivo
      const fileName = `Indice_${caderno?.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'Caderno'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download do arquivo
      XLSX.writeFile(wb, fileName);

      toast.success('Planilha exportada com sucesso!', {
        description: 'O download foi iniciado automaticamente',
      });
    } catch (error) {
      console.error('Erro ao exportar planilha:', error);
      toast.error('Erro ao exportar planilha', {
        description: 'Tente novamente em alguns instantes',
      });
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
          onClick={fetchIndice}
          className="mt-4 bg-[#8fbc8f] text-gray-900 hover:bg-[#7aa87a]"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (indice.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
        <p className="text-gray-400">
          Nenhuma questão encontrada neste caderno.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Índice de Conteúdos
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {caderno?.total_questoes || 0} questões organizadas por disciplina
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarParaPlanilha}
            className="border-[#8fbc8f] bg-[#8fbc8f] text-gray-900 hover:bg-[#7dad7d] hover:scale-105 transition-all font-semibold shadow-md"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Planilha
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="border-gray-500 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:border-gray-400 hover:text-white transition-all font-medium"
          >
            Expandir Tudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="border-gray-500 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:border-gray-400 hover:text-white transition-all font-medium"
          >
            Retrair Tudo
          </Button>
        </div>
      </div>

      {/* Árvore Hierárquica */}
      <div className="space-y-2">
        {indice.map((disciplina) => (
          <div
            key={disciplina.id}
            className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50"
          >
            {/* Disciplina (Nível 1) */}
            <button
              onClick={() => toggleExpand(disciplina.id)}
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                {disciplina.children && disciplina.children.length > 0 ? (
                  expandedItems.has(disciplina.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )
                ) : (
                  <div className="h-5 w-5" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-white">{disciplina.nome}</p>
                  <p className="text-sm text-gray-400">
                    {disciplina.questoes}{' '}
                    {disciplina.questoes === 1 ? 'questão' : 'questões'} -{' '}
                    {disciplina.percentual.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#8fbc8f]">
                    {disciplina.questoes}
                  </p>
                </div>
              </div>
            </button>

            {/* Artigos (Nível 2) */}
            {expandedItems.has(disciplina.id) &&
              disciplina.children &&
              disciplina.children.length > 0 && (
                <div className="border-t border-gray-800 bg-gray-950/50">
                  {disciplina.children.map((artigo) => (
                    <div
                      key={artigo.id}
                      className="flex items-center justify-between border-b border-gray-800 p-4 pl-12 transition-colors last:border-b-0 hover:bg-gray-900/50"
                    >
                      <div className="text-left">
                        <p className="text-sm text-white">{artigo.nome}</p>
                        <p className="text-xs text-gray-500">
                          {artigo.questoes}{' '}
                          {artigo.questoes === 1 ? 'questão' : 'questões'} -{' '}
                          {artigo.percentual.toFixed(2)}% da disciplina
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-400">
                          {artigo.questoes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Footer com Estatísticas */}
      <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900/30 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Total de Questões</p>
            <p className="text-2xl font-bold text-white">
              {caderno?.total_questoes || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Disciplinas</p>
            <p className="text-2xl font-bold text-[#8fbc8f]">{indice.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Artigos</p>
            <p className="text-2xl font-bold text-blue-500">
              {indice.reduce((sum, d) => sum + (d.children?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
