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
import { Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Artigo {
  id: number;
  lei_id: number;
  numero: string;
  titulo: string | null;
  texto_completo: string;
  texto_formatado: string | null;
  capitulo: string | null;
  secao: string | null;
  is_muito_cobrado: boolean;
  peso_edital: number;
  ordem: number;
  palavras_chave: string[];
  created_at: string;
  updated_at: string;
  lei?: {
    id: number;
    nome: string;
    nome_curto: string;
    sigla: string | null;
    disciplina_id: number;
    disciplinas: {
      id: number;
      nome: string;
      slug: string;
    };
  };
}

interface Lei {
  id: number;
  nome: string;
  nome_curto: string;
  sigla: string | null;
  disciplina_id: number;
}

export default function ArtigosPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    lei_id: '',
    numero: '',
    titulo: '',
    texto_completo: '',
    texto_formatado: '',
    capitulo: '',
    secao: '',
    is_muito_cobrado: false,
    peso_edital: 1,
    ordem: 0,
    palavras_chave: '',
  });

  // Buscar artigos
  const { data: artigos, isLoading } = useQuery({
    queryKey: ['admin-artigos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/artigos');
      if (!res.ok) throw new Error('Erro ao buscar artigos');
      const json = await res.json();
      return json.artigos as Artigo[];
    },
  });

  // Buscar leis
  const { data: leis } = useQuery({
    queryKey: ['admin-leis'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/leis');
      if (!res.ok) throw new Error('Erro ao buscar leis');
      const json = await res.json();
      return json.leis as Lei[];
    },
  });

  // Criar artigo
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        palavras_chave: data.palavras_chave
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k),
      };
      const res = await fetch('/api/admin/configuracoes/artigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar artigo');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artigos'] });
      toast.success('Artigo criado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Atualizar artigo
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const payload = {
        ...data,
        palavras_chave: data.palavras_chave
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k),
      };
      const res = await fetch(`/api/admin/configuracoes/artigos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar artigo');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artigos'] });
      toast.success('Artigo atualizado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Deletar artigo
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/configuracoes/artigos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar artigo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artigos'] });
      toast.success('Artigo deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      lei_id: '',
      numero: '',
      titulo: '',
      texto_completo: '',
      texto_formatado: '',
      capitulo: '',
      secao: '',
      is_muito_cobrado: false,
      peso_edital: 1,
      ordem: 0,
      palavras_chave: '',
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (artigo: Artigo) => {
    setEditingId(artigo.id);
    setFormData({
      lei_id: artigo.lei_id.toString(),
      numero: artigo.numero,
      titulo: artigo.titulo || '',
      texto_completo: artigo.texto_completo,
      texto_formatado: artigo.texto_formatado || '',
      capitulo: artigo.capitulo || '',
      secao: artigo.secao || '',
      is_muito_cobrado: artigo.is_muito_cobrado,
      peso_edital: artigo.peso_edital,
      ordem: artigo.ordem,
      palavras_chave: artigo.palavras_chave.join(', '),
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

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Artigos</h1>
          <p className="text-gray-400 mt-2">Gerencie os artigos das leis (Lei Seca)</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          {isFormOpen ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Novo Artigo
            </>
          )}
        </Button>
      </div>

      {/* Form de criação/edição */}
      {isFormOpen && (
        <Card className="bg-gray-950 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Artigo' : 'Novo Artigo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lei_id">Lei *</Label>
              <Select
                value={formData.lei_id}
                onValueChange={(value) => setFormData({ ...formData, lei_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma lei" />
                </SelectTrigger>
                <SelectContent>
                  {leis?.map((lei) => (
                    <SelectItem key={lei.id} value={lei.id.toString()}>
                      {lei.nome_curto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número do Artigo *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: Art. 5º, LXXVIII"
                  required
                />
              </div>

              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Homicídio Simples"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="texto_completo">Texto Completo (Lei Seca) *</Label>
              <Textarea
                id="texto_completo"
                value={formData.texto_completo}
                onChange={(e) => setFormData({ ...formData, texto_completo: e.target.value })}
                placeholder="Digite o texto literal do artigo..."
                rows={6}
                required
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="texto_formatado">Texto Formatado (HTML - opcional)</Label>
              <Textarea
                id="texto_formatado"
                value={formData.texto_formatado}
                onChange={(e) => setFormData({ ...formData, texto_formatado: e.target.value })}
                placeholder="HTML com <strong> em palavras-chave..."
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capitulo">Capítulo</Label>
                <Input
                  id="capitulo"
                  value={formData.capitulo}
                  onChange={(e) => setFormData({ ...formData, capitulo: e.target.value })}
                  placeholder="Ex: Título I - Dos Direitos Fundamentais"
                />
              </div>

              <div>
                <Label htmlFor="secao">Seção</Label>
                <Input
                  id="secao"
                  value={formData.secao}
                  onChange={(e) => setFormData({ ...formData, secao: e.target.value })}
                  placeholder="Ex: Capítulo II - Dos Direitos Sociais"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="palavras_chave">Palavras-Chave</Label>
              <Input
                id="palavras_chave"
                value={formData.palavras_chave}
                onChange={(e) => setFormData({ ...formData, palavras_chave: e.target.value })}
                placeholder="Ex: homicídio, matar, doloso (separados por vírgula)"
              />
              <p className="text-xs text-gray-500 mt-1">Separe com vírgulas</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="peso_edital">Peso no Edital *</Label>
                <Select
                  value={formData.peso_edital.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, peso_edital: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixo</SelectItem>
                    <SelectItem value="2">2 - Baixo</SelectItem>
                    <SelectItem value="3">3 - Médio</SelectItem>
                    <SelectItem value="4">4 - Alto</SelectItem>
                    <SelectItem value="5">5 - Muito Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="pt-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_muito_cobrado"
                    checked={formData.is_muito_cobrado}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, is_muito_cobrado: checked })
                    }
                  />
                  <label htmlFor="is_muito_cobrado" className="text-sm text-gray-300 cursor-pointer">
                    Muito Cobrado
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
                <th className="text-left p-4 text-gray-400 font-medium">Número</th>
                <th className="text-left p-4 text-gray-400 font-medium">Título</th>
                <th className="text-left p-4 text-gray-400 font-medium">Texto</th>
                <th className="text-left p-4 text-gray-400 font-medium">Lei</th>
                <th className="text-left p-4 text-gray-400 font-medium">Peso</th>
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
              ) : artigos && artigos.length > 0 ? (
                artigos.map((artigo) => (
                  <tr key={artigo.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="p-4 text-gray-300">{artigo.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{artigo.numero}</span>
                        {artigo.is_muito_cobrado && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{artigo.titulo || '-'}</td>
                    <td className="p-4 text-gray-400 max-w-xs truncate font-mono text-xs">
                      {truncate(artigo.texto_completo, 80)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {artigo.lei?.nome_curto}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < artigo.peso_edital
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(artigo)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Deletar "${artigo.numero}"?`)) {
                              deleteMutation.mutate(artigo.id);
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
                    Nenhum artigo encontrado
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
