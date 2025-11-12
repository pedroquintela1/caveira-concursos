'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Assunto {
  id: number;
  nome: string;
  disciplina_id: number;
  parent_id: number | null;
  nivel: number;
  ordem: number;
  created_at: string;
  disciplina?: {
    id: number;
    nome: string;
    slug: string;
  };
  parent?: {
    id: number;
    nome: string;
  } | null;
}

interface Disciplina {
  id: number;
  nome: string;
  slug: string;
}

export default function AssuntosPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    disciplina_id: '',
    parent_id: 'null',
    nivel: 1,
    ordem: 0,
  });

  // Buscar assuntos
  const { data: assuntos, isLoading } = useQuery({
    queryKey: ['admin-assuntos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/assuntos');
      if (!res.ok) throw new Error('Erro ao buscar assuntos');
      const json = await res.json();
      return json.assuntos as Assunto[];
    },
  });

  // Buscar disciplinas para o select
  const { data: disciplinas } = useQuery({
    queryKey: ['admin-disciplinas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/disciplinas');
      if (!res.ok) throw new Error('Erro ao buscar disciplinas');
      const json = await res.json();
      return json.disciplinas as Disciplina[];
    },
  });

  // Criar assunto
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/assuntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar assunto');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assuntos'] });
      toast.success('Assunto criado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar assunto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/assuntos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar assunto');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assuntos'] });
      toast.success('Assunto atualizado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar assunto
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/assuntos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar assunto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assuntos'] });
      toast.success('Assunto deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      disciplina_id: '',
      parent_id: 'null',
      nivel: 1,
      ordem: 0,
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (assunto: Assunto) => {
    setEditingId(assunto.id);
    setFormData({
      nome: assunto.nome,
      disciplina_id: assunto.disciplina_id.toString(),
      parent_id: assunto.parent_id ? assunto.parent_id.toString() : 'null',
      nivel: assunto.nivel,
      ordem: assunto.ordem,
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

  // Filtrar assuntos por disciplina selecionada (para parent)
  const assuntosFiltrados = assuntos?.filter(
    (a) => a.disciplina_id.toString() === formData.disciplina_id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Assuntos</h1>
          <p className="mt-2 text-gray-400">
            Gerencie os assuntos/tópicos das disciplinas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Novo Assunto
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingId ? 'Editar Assunto' : 'Novo Assunto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="disciplina_id">Disciplina *</Label>
              <Select
                value={formData.disciplina_id}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    disciplina_id: value,
                    parent_id: 'null',
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas?.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nome">Nome do Assunto *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Princípios Constitucionais"
                required
              />
            </div>

            <div>
              <Label htmlFor="parent_id">Assunto Pai (opcional)</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum (assunto raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum (assunto raiz)</SelectItem>
                  {assuntosFiltrados?.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nivel">Nível</Label>
                <Input
                  id="nivel"
                  type="number"
                  value={formData.nivel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nivel: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={5}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Profundidade na hierarquia (1-5)
                </p>
              </div>
              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ordem: parseInt(e.target.value),
                    })
                  }
                  min={0}
                />
              </div>
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
                  Disciplina
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Assunto Pai
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Nível
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Ordem
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
              ) : assuntos && assuntos.length > 0 ? (
                assuntos.map((assunto) => (
                  <tr
                    key={assunto.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="p-4 text-gray-300">{assunto.id}</td>
                    <td className="p-4 font-medium text-white">
                      <span
                        style={{ marginLeft: `${(assunto.nivel - 1) * 20}px` }}
                      >
                        {assunto.nivel > 1 && '↳ '}
                        {assunto.nome}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {assunto.disciplina?.nome || '-'}
                    </td>
                    <td className="p-4 text-gray-400">
                      {assunto.parent?.nome || '-'}
                    </td>
                    <td className="p-4 text-gray-400">{assunto.nivel}</td>
                    <td className="p-4 text-gray-400">{assunto.ordem}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(assunto)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Deletar este assunto?')) {
                              deleteMutation.mutate(assunto.id);
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
                    Nenhum assunto encontrado
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
