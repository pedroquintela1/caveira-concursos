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

interface AreaCarreira {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
  is_active: boolean;
  created_at: string;
}

export default function AreasCarreiraPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    ordem: 0,
  });

  // Buscar áreas
  const { data, isLoading } = useQuery({
    queryKey: ['admin-areas-carreira'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/areas-carreira');
      if (!res.ok) throw new Error('Erro ao buscar áreas de carreira');
      const json = await res.json();
      return json.areas as AreaCarreira[];
    },
  });

  // Criar área
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/areas-carreira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar área de carreira');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas-carreira'] });
      toast.success('Área de carreira criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar área
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/areas-carreira/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar área de carreira');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas-carreira'] });
      toast.success('Área de carreira atualizada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar área
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/areas-carreira/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar área de carreira');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas-carreira'] });
      toast.success('Área de carreira deletada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      slug: '',
      descricao: '',
      ordem: 0,
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (area: AreaCarreira) => {
    setEditingId(area.id);
    setFormData({
      nome: area.nome,
      slug: area.slug,
      descricao: area.descricao || '',
      ordem: area.ordem,
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
          <h1 className="text-3xl font-bold text-white">Áreas de Carreira</h1>
          <p className="mt-2 text-gray-400">
            Gerencie as áreas de carreira para classificação de concursos
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nova Área
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingId ? 'Editar Área de Carreira' : 'Nova Área de Carreira'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Policial"
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
                  placeholder="policial"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descrição da área de carreira"
                rows={3}
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((area) => (
                  <tr
                    key={area.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="p-4 text-gray-300">{area.id}</td>
                    <td className="p-4 font-medium text-white">{area.nome}</td>
                    <td className="p-4 text-gray-400">{area.slug}</td>
                    <td className="p-4 text-gray-400">{area.ordem}</td>
                    <td className="p-4">
                      {area.is_active ? (
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
                          onClick={() => handleEdit(area)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Deletar esta área de carreira?')) {
                              deleteMutation.mutate(area.id);
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma área de carreira encontrada
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
