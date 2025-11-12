'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Disciplina {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
  cor_destaque: string;
  is_active: boolean;
  created_at: string;
}

export default function DisciplinasPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    icone: '',
    ordem: 0,
    cor_destaque: '#2563EB',
  });

  // Buscar disciplinas
  const { data, isLoading } = useQuery({
    queryKey: ['admin-disciplinas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/disciplinas');
      if (!res.ok) throw new Error('Erro ao buscar disciplinas');
      const json = await res.json();
      return json.disciplinas as Disciplina[];
    },
  });

  // Criar disciplina
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/disciplinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar disciplina');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disciplinas'] });
      toast.success('Disciplina criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar disciplina
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/disciplinas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar disciplina');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disciplinas'] });
      toast.success('Disciplina atualizada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar disciplina
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/disciplinas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar disciplina');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disciplinas'] });
      toast.success('Disciplina desativada com sucesso!');
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
      icone: '',
      ordem: 0,
      cor_destaque: '#2563EB',
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (disciplina: Disciplina) => {
    setEditingId(disciplina.id);
    setFormData({
      nome: disciplina.nome,
      slug: disciplina.slug,
      descricao: disciplina.descricao || '',
      icone: disciplina.icone || '',
      ordem: disciplina.ordem,
      cor_destaque: disciplina.cor_destaque,
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
      slug: nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Disciplinas</h1>
          <p className="text-gray-400 mt-2">Gerencie as disciplinas do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nova Disciplina
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="bg-gray-950 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Disciplina' : 'Nova Disciplina'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Direito Penal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="direito-penal"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da disciplina"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="icone">Ícone (Lucide)</Label>
                <Input
                  id="icone"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  placeholder="Ex: Scale"
                />
              </div>
              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="cor">Cor Destaque</Label>
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor_destaque}
                  onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabela */}
      <Card className="bg-gray-950 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Nome</th>
                <th className="text-left p-4 text-gray-400 font-medium">Slug</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ícone</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ordem</th>
                <th className="text-left p-4 text-gray-400 font-medium">Cor</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((disciplina) => (
                  <tr key={disciplina.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="p-4 text-gray-300">{disciplina.id}</td>
                    <td className="p-4 text-white font-medium">{disciplina.nome}</td>
                    <td className="p-4 text-gray-400">{disciplina.slug}</td>
                    <td className="p-4 text-gray-400">{disciplina.icone || '-'}</td>
                    <td className="p-4 text-gray-400">{disciplina.ordem}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: disciplina.cor_destaque }}
                        />
                        <span className="text-gray-400 text-sm">{disciplina.cor_destaque}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {disciplina.is_active ? (
                        <span className="text-emerald-500 text-sm">Ativa</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Inativa</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(disciplina)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Desativar esta disciplina?')) {
                              deleteMutation.mutate(disciplina.id);
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
                  <td colSpan={8} className="text-center p-8 text-gray-500">
                    Nenhuma disciplina encontrada
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
