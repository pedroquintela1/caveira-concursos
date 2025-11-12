'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Banca {
  id: number;
  nome: string;
  sigla: string;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function BancasPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    website: '',
    logo_url: '',
  });

  // Buscar bancas
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bancas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/bancas');
      if (!res.ok) throw new Error('Erro ao buscar bancas');
      const json = await res.json();
      return json.bancas as Banca[];
    },
  });

  // Criar banca
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/bancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar banca');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bancas'] });
      toast.success('Banca criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar banca
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/bancas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar banca');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bancas'] });
      toast.success('Banca atualizada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar banca
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/bancas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar banca');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bancas'] });
      toast.success('Banca desativada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      sigla: '',
      website: '',
      logo_url: '',
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (banca: Banca) => {
    setEditingId(banca.id);
    setFormData({
      nome: banca.nome,
      sigla: banca.sigla,
      website: banca.website || '',
      logo_url: banca.logo_url || '',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bancas</h1>
          <p className="text-gray-400 mt-2">Gerencie as bancas organizadoras de concursos</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nova Banca
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="bg-gray-950 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Banca' : 'Nova Banca'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: CESPE/CEBRASPE"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sigla">Sigla *</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                  placeholder="Ex: CESPE"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.cespe.unb.br"
                />
              </div>
              <div>
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
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
                <th className="text-left p-4 text-gray-400 font-medium">Sigla</th>
                <th className="text-left p-4 text-gray-400 font-medium">Website</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((banca) => (
                  <tr key={banca.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="p-4 text-gray-300">{banca.id}</td>
                    <td className="p-4 text-white font-medium">{banca.nome}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
                        {banca.sigla}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {banca.website ? (
                        <a
                          href={banca.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {new URL(banca.website).hostname}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">
                      {banca.is_active ? (
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
                          onClick={() => handleEdit(banca)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Desativar esta banca?')) {
                              deleteMutation.mutate(banca.id);
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
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    Nenhuma banca encontrada
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
