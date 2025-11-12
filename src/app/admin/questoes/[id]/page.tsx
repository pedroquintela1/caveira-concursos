'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditarQuestaoPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    enunciado: '',
    alternativa_a: '',
    alternativa_b: '',
    alternativa_c: '',
    alternativa_d: '',
    alternativa_e: '',
    gabarito: 'A' as 'A' | 'B' | 'C' | 'D' | 'E',
    explicacao: '',
    banca_id: '',
    orgao_id: 'null',
    disciplina_id: '',
    artigo_id: 'null',
    ano: new Date().getFullYear(),
    cargo: '',
    dificuldade: 'null' as 'facil' | 'medio' | 'dificil' | 'null',
    assuntos_ids: [] as number[],
  });

  // Buscar questão
  const { data: questaoData, isLoading: loadingQuestao } = useQuery({
    queryKey: ['admin-questao', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/questoes/${params.id}`);
      if (!res.ok) throw new Error('Questão não encontrada');
      const json = await res.json();
      return json.questao;
    },
  });

  // Carregar dados no form quando questão for buscada
  useEffect(() => {
    if (questaoData) {
      setFormData({
        enunciado: questaoData.enunciado,
        alternativa_a: questaoData.alternativa_a,
        alternativa_b: questaoData.alternativa_b,
        alternativa_c: questaoData.alternativa_c,
        alternativa_d: questaoData.alternativa_d,
        alternativa_e: questaoData.alternativa_e,
        gabarito: questaoData.gabarito,
        explicacao: questaoData.explicacao || '',
        banca_id: questaoData.banca_id.toString(),
        orgao_id: questaoData.orgao_id?.toString() || 'null',
        disciplina_id: questaoData.disciplina_id.toString(),
        artigo_id: questaoData.artigo_id?.toString() || 'null',
        ano: questaoData.ano,
        cargo: questaoData.cargo || '',
        dificuldade: questaoData.dificuldade || 'null',
        assuntos_ids: questaoData.assuntos_ids || [],
      });
    }
  }, [questaoData]);

  // Buscar filtros
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

  // Buscar artigos
  const { data: artigos } = useQuery({
    queryKey: ['admin-artigos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/artigos');
      const json = await res.json();
      return json.artigos || [];
    },
  });

  // Buscar assuntos filtrados pela disciplina selecionada
  const { data: assuntos } = useQuery({
    queryKey: ['admin-assuntos', formData.disciplina_id],
    queryFn: async () => {
      const res = await fetch('/api/admin/configuracoes/assuntos');
      const json = await res.json();
      return json.assuntos || [];
    },
    enabled: !!formData.disciplina_id,
  });

  // Filtrar assuntos pela disciplina selecionada
  const assuntosFiltrados =
    assuntos?.filter(
      (a: any) => a.disciplina_id.toString() === formData.disciplina_id
    ) || [];

  // Atualizar questão
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        banca_id: parseInt(data.banca_id),
        orgao_id:
          data.orgao_id && data.orgao_id !== 'null'
            ? parseInt(data.orgao_id)
            : null,
        disciplina_id: parseInt(data.disciplina_id),
        artigo_id:
          data.artigo_id && data.artigo_id !== 'null'
            ? parseInt(data.artigo_id)
            : null,
        dificuldade:
          data.dificuldade && data.dificuldade !== 'null'
            ? data.dificuldade
            : null,
        cargo: data.cargo || null,
        explicacao: data.explicacao || null,
        assuntos_ids: data.assuntos_ids,
      };

      const res = await fetch(`/api/admin/questoes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar questão');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Questão atualizada com sucesso!');
      router.push('/admin/questoes');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (loadingQuestao) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/questoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Editar Questão #{params.id}
          </h1>
          <p className="mt-2 text-gray-400">Atualize os dados da questão</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enunciado */}
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Enunciado</h3>
          <Textarea
            value={formData.enunciado}
            onChange={(e) =>
              setFormData({ ...formData, enunciado: e.target.value })
            }
            rows={6}
            required
            className="font-mono text-sm"
          />
        </Card>

        {/* Alternativas */}
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Alternativas
          </h3>
          <div className="space-y-4">
            {(['a', 'b', 'c', 'd', 'e'] as const).map((letra) => (
              <div key={letra}>
                <Label htmlFor={`alternativa_${letra}`}>
                  Alternativa {letra.toUpperCase()} *
                </Label>
                <Input
                  id={`alternativa_${letra}`}
                  value={
                    formData[
                      `alternativa_${letra}` as keyof typeof formData
                    ] as string
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`alternativa_${letra}`]: e.target.value,
                    })
                  }
                  required
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Gabarito e Explicação */}
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Gabarito e Explicação
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="gabarito">Gabarito *</Label>
              <Select
                value={formData.gabarito}
                onValueChange={(value) =>
                  setFormData({ ...formData, gabarito: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                    <SelectItem key={letra} value={letra}>
                      {letra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="explicacao">Explicação</Label>
              <Textarea
                id="explicacao"
                value={formData.explicacao}
                onChange={(e) =>
                  setFormData({ ...formData, explicacao: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Metadados */}
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Metadados</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <Label>Banca *</Label>
              <Select
                value={formData.banca_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, banca_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bancas?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Órgão</Label>
              <Select
                value={formData.orgao_id}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    orgao_id: value === 'null' ? '' : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum</SelectItem>
                  {orgaos?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Disciplina *</Label>
              <Select
                value={formData.disciplina_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, disciplina_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas?.map((d: any) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Artigo (Lei Seca - opcional)</Label>
              <Select
                value={formData.artigo_id}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    artigo_id: value === 'null' ? '' : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um artigo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum</SelectItem>
                  {artigos?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.lei?.nome_curto} - {a.numero}{' '}
                      {a.titulo && `(${a.titulo})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ano *</Label>
              <Input
                type="number"
                value={formData.ano}
                onChange={(e) =>
                  setFormData({ ...formData, ano: parseInt(e.target.value) })
                }
                min={2000}
                max={2030}
                required
              />
            </div>

            <div>
              <Label>Cargo</Label>
              <Input
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Dificuldade</Label>
              <Select
                value={formData.dificuldade}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    dificuldade: value === 'null' ? '' : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Não especificada</SelectItem>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Assuntos */}
        <Card className="border-gray-800 bg-gray-950 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Assuntos da Questão{' '}
            {formData.disciplina_id
              ? ''
              : '(selecione uma disciplina primeiro)'}
          </h3>

          {!formData.disciplina_id ? (
            <p className="text-sm text-gray-500">
              Selecione uma disciplina para ver os assuntos disponíveis
            </p>
          ) : assuntosFiltrados.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum assunto encontrado para esta disciplina
            </p>
          ) : (
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {assuntosFiltrados.map((assunto: any) => (
                <div key={assunto.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assunto-${assunto.id}`}
                    checked={formData.assuntos_ids.includes(assunto.id)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          assuntos_ids: [...formData.assuntos_ids, assunto.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assuntos_ids: formData.assuntos_ids.filter(
                            (id) => id !== assunto.id
                          ),
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor={`assunto-${assunto.id}`}
                    className="cursor-pointer select-none text-sm text-gray-300"
                    style={{ marginLeft: `${(assunto.nivel - 1) * 20}px` }}
                  >
                    {assunto.nivel > 1 && '↳ '}
                    {assunto.nome}
                    {assunto.parent && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({assunto.parent.nome})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}

          {formData.assuntos_ids.length > 0 && (
            <p className="mt-3 text-sm text-emerald-500">
              {formData.assuntos_ids.length} assunto(s) selecionado(s)
            </p>
          )}
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/questoes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Check className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
