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

interface Orgao {
  id: number;
  nome: string;
  sigla: string;
  esfera: 'federal' | 'estadual' | 'municipal' | null;
  area: string | null;
  uf: string | null;
  is_active: boolean;
  created_at: string;
}

const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

export default function OrgaosPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    esfera: '' as 'federal' | 'estadual' | 'municipal' | '',
    area: '',
    uf: 'nacional',
  });

  // Buscar órgãos
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orgaos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/orgaos');
      if (!res.ok) throw new Error('Erro ao buscar órgãos');
      const json = await res.json();
      return json.orgaos as Orgao[];
    },
  });

  // Criar órgão
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/configuracoes/orgaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar órgão');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orgaos'] });
      toast.success('Órgão criado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar órgão
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/configuracoes/orgaos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar órgão');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orgaos'] });
      toast.success('Órgão atualizado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar órgão
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/orgaos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar órgão');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orgaos'] });
      toast.success('Órgão desativado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      sigla: '',
      esfera: '',
      area: '',
      uf: 'nacional',
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (orgao: Orgao) => {
    setEditingId(orgao.id);
    setFormData({
      nome: orgao.nome,
      sigla: orgao.sigla,
      esfera: orgao.esfera || '',
      area: orgao.area || '',
      uf: orgao.uf || 'nacional',
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
          <h1 className="text-3xl font-bold text-white">Órgãos</h1>
          <p className="mt-2 text-gray-400">
            Gerencie os órgãos públicos do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Novo Órgão
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingId ? 'Editar Órgão' : 'Novo Órgão'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Polícia Federal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sigla">Sigla *</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sigla: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Ex: PF"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="esfera">Esfera</Label>
                <Select
                  value={formData.esfera}
                  onValueChange={(value) =>
                    setFormData({ ...formData, esfera: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  placeholder="Ex: Segurança Pública"
                />
              </div>

              <div>
                <Label htmlFor="uf">UF</Label>
                <Select
                  value={formData.uf}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      uf: value === 'nacional' ? '' : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    {UFS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Sigla
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Esfera
                </th>
                <th className="p-4 text-left font-medium text-gray-400">
                  Área
                </th>
                <th className="p-4 text-left font-medium text-gray-400">UF</th>
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
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((orgao) => (
                  <tr
                    key={orgao.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="p-4 text-gray-300">{orgao.id}</td>
                    <td className="p-4 font-medium text-white">{orgao.nome}</td>
                    <td className="p-4">
                      <span className="rounded bg-purple-500/20 px-2 py-1 text-sm font-medium text-purple-400">
                        {orgao.sigla}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-gray-400">
                      {orgao.esfera || '-'}
                    </td>
                    <td className="p-4 text-gray-400">{orgao.area || '-'}</td>
                    <td className="p-4">
                      {orgao.uf ? (
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-sm font-medium text-blue-400">
                          {orgao.uf}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Nacional</span>
                      )}
                    </td>
                    <td className="p-4">
                      {orgao.is_active ? (
                        <span className="text-sm text-emerald-500">Ativo</span>
                      ) : (
                        <span className="text-sm text-gray-500">Inativo</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(orgao)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Desativar este órgão?')) {
                              deleteMutation.mutate(orgao.id);
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
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Nenhum órgão encontrado
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
