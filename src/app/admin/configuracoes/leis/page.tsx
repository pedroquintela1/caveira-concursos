'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Lei {
  id: number;
  nome: string;
  nome_curto: string;
  sigla: string | null;
  numero_lei: string | null;
  ementa: string | null;
  data_publicacao: string | null;
  link_oficial: string | null;
  total_artigos: number;
  ordem: number;
  is_mais_cobrada: boolean;
  is_active: boolean;
  disciplina_id: number;
  created_at: string;
  updated_at: string;
  disciplina?: {
    id: number;
    nome: string;
    slug: string;
  };
}

interface Disciplina {
  id: number;
  nome: string;
  slug: string;
}

export default function LeisPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    nome_curto: '',
    sigla: '',
    numero_lei: '',
    ementa: '',
    data_publicacao: '',
    link_oficial: '',
    disciplina_id: '',
    total_artigos: 0,
    ordem: 0,
    is_mais_cobrada: false,
    is_active: true,
  });

  // Buscar leis
  const { data: leis, isLoading } = useQuery({
    queryKey: ['admin-leis'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/leis');
      if (!res.ok) throw new Error('Erro ao buscar leis');
      const json = await res.json();
      return json.leis as Lei[];
    },
  });

  // Buscar disciplinas
  const { data: disciplinas } = useQuery({
    queryKey: ['admin-disciplinas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/disciplinas');
      if (!res.ok) throw new Error('Erro ao buscar disciplinas');
      const json = await res.json();
      return json.disciplinas as Disciplina[];
    },
  });

  // Criar lei
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/leis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar lei');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leis'] });
      toast.success('Lei criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar lei
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/leis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar lei');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leis'] });
      toast.success('Lei atualizada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar lei
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/leis/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar lei');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leis'] });
      toast.success('Lei deletada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      nome_curto: '',
      sigla: '',
      numero_lei: '',
      ementa: '',
      data_publicacao: '',
      link_oficial: '',
      disciplina_id: '',
      total_artigos: 0,
      ordem: 0,
      is_mais_cobrada: false,
      is_active: true,
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (lei: Lei) => {
    setEditingId(lei.id);
    setFormData({
      nome: lei.nome,
      nome_curto: lei.nome_curto,
      sigla: lei.sigla || '',
      numero_lei: lei.numero_lei || '',
      ementa: lei.ementa || '',
      data_publicacao: lei.data_publicacao || '',
      link_oficial: lei.link_oficial || '',
      disciplina_id: lei.disciplina_id.toString(),
      total_artigos: lei.total_artigos,
      ordem: lei.ordem,
      is_mais_cobrada: lei.is_mais_cobrada,
      is_active: lei.is_active,
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
          <h1 className="text-3xl font-bold text-white">Leis</h1>
          <p className="text-gray-400 mt-2">Gerencie as legislações estudadas (CF/88, CP, CPP, etc.)</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nova Lei
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="bg-gray-950 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Lei' : 'Nova Lei'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="disciplina_id">Disciplina *</Label>
              <Select
                value={formData.disciplina_id}
                onValueChange={(value) => setFormData({ ...formData, disciplina_id: value })}
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
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Constituição da República Federativa do Brasil de 1988"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nome_curto">Nome Curto *</Label>
                <Input
                  id="nome_curto"
                  value={formData.nome_curto}
                  onChange={(e) => setFormData({ ...formData, nome_curto: e.target.value })}
                  placeholder="Ex: CF/88"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Ex: CF"
                />
              </div>

              <div>
                <Label htmlFor="numero_lei">Número da Lei</Label>
                <Input
                  id="numero_lei"
                  value={formData.numero_lei}
                  onChange={(e) => setFormData({ ...formData, numero_lei: e.target.value })}
                  placeholder="Ex: Lei 12.850/2013"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ementa">Ementa</Label>
              <Textarea
                id="ementa"
                value={formData.ementa}
                onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
                placeholder="Descrição resumida da lei..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_publicacao">Data de Publicação</Label>
                <Input
                  id="data_publicacao"
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="total_artigos">Total de Artigos</Label>
                <Input
                  id="total_artigos"
                  type="number"
                  value={formData.total_artigos}
                  onChange={(e) => setFormData({ ...formData, total_artigos: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="link_oficial">Link Oficial</Label>
              <Input
                id="link_oficial"
                type="url"
                value={formData.link_oficial}
                onChange={(e) => setFormData({ ...formData, link_oficial: e.target.value })}
                placeholder="https://www.planalto.gov.br/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="space-y-2 pt-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_mais_cobrada"
                    checked={formData.is_mais_cobrada}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, is_mais_cobrada: checked })
                    }
                  />
                  <label htmlFor="is_mais_cobrada" className="text-sm text-gray-300 cursor-pointer">
                    Lei Mais Cobrada
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-300 cursor-pointer">
                    Ativa
                  </label>
                </div>
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
                <th className="text-left p-4 text-gray-400 font-medium w-12">ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Nome Curto</th>
                <th className="text-left p-4 text-gray-400 font-medium">Nome Completo</th>
                <th className="text-left p-4 text-gray-400 font-medium">Disciplina</th>
                <th className="text-left p-4 text-gray-400 font-medium">Artigos</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : leis && leis.length > 0 ? (
                leis.map((lei) => (
                  <tr key={lei.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="p-4 text-gray-300">{lei.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{lei.nome_curto}</span>
                        {lei.is_mais_cobrada && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            Mais Cobrada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 max-w-md truncate">{lei.nome}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {lei.disciplina?.nome}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{lei.total_artigos}</td>
                    <td className="p-4">
                      {lei.is_active ? (
                        <span className="text-emerald-500 text-sm">Ativa</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Inativa</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {lei.link_oficial && (
                          <a
                            href={lei.link_oficial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(lei)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Deletar "${lei.nome_curto}"?`)) {
                              deleteMutation.mutate(lei.id);
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
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    Nenhuma lei encontrada
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
