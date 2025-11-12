'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Formacao {
  id: number;
  nome: string;
  slug: string;
  area_conhecimento: string | null;
  ordem: number;
  is_active: boolean;
  created_at: string;
}

export default function FormacoesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    area_conhecimento: '',
    ordem: 0,
  });

  // Buscar formações
  const { data, isLoading } = useQuery({
    queryKey: ['admin-formacoes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/formacoes');
      if (!res.ok) throw new Error('Erro ao buscar formações');
      const json = await res.json();
      return json.formacoes as Formacao[];
    },
  });

  // Criar formação
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/formacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar formação');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-formacoes'] });
      toast.success('Formação criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar formação
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/formacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar formação');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-formacoes'] });
      toast.success('Formação atualizada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar formação
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/formacoes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar formação');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-formacoes'] });
      toast.success('Formação deletada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      slug: '',
      area_conhecimento: '',
      ordem: 0,
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (formacao: Formacao) => {
    setEditingId(formacao.id);
    setFormData({
      nome: formacao.nome,
      slug: formacao.slug,
      area_conhecimento: formacao.area_conhecimento || '',
      ordem: formacao.ordem,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Auto-gerar slug ao digitar nome
  const handleNomeChange = (nome: string) => {
    setFormData((prev) => ({
      ...prev,
      nome,
      slug: nome
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Formações Acadêmicas
          </h1>
          <p className="mt-2 text-gray-400">
            Gerencie as formações acadêmicas exigidas nos concursos
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nova Formação
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingId ? 'Editar Formação' : 'Nova Formação'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Direito"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="direito"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="area_conhecimento">Área de Conhecimento</Label>
              <Input
                id="area_conhecimento"
                value={formData.area_conhecimento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    area_conhecimento: e.target.value,
                  })
                }
                placeholder="Ex: Ciências Humanas"
              />
            </div>

            <div>
              <Label htmlFor="ordem">Ordem de Exibição</Label>
              <Input
                id="ordem"
                type="number"
                value={formData.ordem}
                onChange={(e) =>
                  setFormData({ ...formData, ordem: parseInt(e.target.value) })
                }
                min={0}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabela */}
      <Card className="border-gray-800 bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-4 text-left font-medium text-gray-400">ID</th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Nome
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Slug
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Área de Conhecimento
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Ordem
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
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((formacao) => (
                  <tr
                    key={formacao.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="p-4 text-gray-300">{formacao.id}</td>
                    <td className="p-4 font-medium text-white">
                      {formacao.nome}
                    </td>
                    <td className="p-4 text-gray-400">{formacao.slug}</td>
                    <td className="p-4 text-gray-400">
                      {formacao.area_conhecimento || '-'}
                    </td>
                    <td className="p-4 text-gray-400">{formacao.ordem}</td>
                    <td className="p-4">
                      {formacao.is_active ? (
                        <span className="text-sm text-emerald-500">Ativa</span>
                      ) : (
                        <span className="text-sm text-gray-500">Inativa</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(formacao)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Deletar esta formação?')) {
                              deleteMutation.mutate(formacao.id);
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
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Nenhuma formação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
