'use client';

import { useState } from 'react';
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
import { ArrowLeft, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovaQuestaoPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
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

  // Criar questão
  const createMutation = useMutation({
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

      const res = await fetch('/api/admin/questoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar questão');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Questão criada com sucesso!');
      router.push('/admin/questoes');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.enunciado || !formData.banca_id || !formData.disciplina_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (
      !formData.alternativa_a ||
      !formData.alternativa_b ||
      !formData.alternativa_c ||
      !formData.alternativa_d ||
      !formData.alternativa_e
    ) {
      toast.error('Todas as alternativas são obrigatórias');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/questoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Nova Questão</h1>
          <p className="mt-2 text-gray-400">
            Cadastre uma nova questão de concurso
          </p>
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
            placeholder="Digite o enunciado completo da questão..."
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
                <Label
                  htmlFor={`alternativa_${letra}`}
                  className="text-gray-300"
                >
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
                  placeholder={`Digite a alternativa ${letra.toUpperCase()}`}
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
              <Label htmlFor="gabarito">Gabarito (Resposta Correta) *</Label>
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
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="explicacao">Explicação (Opcional)</Label>
              <Textarea
                id="explicacao"
                value={formData.explicacao}
                onChange={(e) =>
                  setFormData({ ...formData, explicacao: e.target.value })
                }
                placeholder="Explique por que a alternativa correta está certa..."
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
              <Label htmlFor="banca_id">Banca *</Label>
              <Select
                value={formData.banca_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, banca_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {bancas?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.sigla} - {b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orgao_id">Órgão</Label>
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
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum</SelectItem>
                  {orgaos?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.sigla} - {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disciplina_id">Disciplina *</Label>
              <Select
                value={formData.disciplina_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, disciplina_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label htmlFor="artigo_id">Artigo (Lei Seca - opcional)</Label>
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
              <Label htmlFor="ano">Ano *</Label>
              <Input
                id="ano"
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
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
                placeholder="Ex: Soldado PM"
              />
            </div>

            <div>
              <Label htmlFor="dificuldade">Dificuldade</Label>
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
                  <SelectValue placeholder="Selecione" />
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Ocultar' : 'Visualizar'} Preview
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <Check className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Salvando...' : 'Criar Questão'}
          </Button>
        </div>

        {/* Preview */}
        {showPreview && formData.enunciado && (
          <Card className="border-gray-800 bg-gray-950 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Preview</h3>
            <div className="space-y-4">
              <p className="leading-relaxed text-white">{formData.enunciado}</p>
              <div className="space-y-2">
                {(['a', 'b', 'c', 'd', 'e'] as const).map((letra) => {
                  const alternativa = formData[
                    `alternativa_${letra}` as keyof typeof formData
                  ] as string;
                  const isGabarito = formData.gabarito === letra.toUpperCase();
                  return alternativa ? (
                    <div
                      key={letra}
                      className={`rounded-lg border p-3 ${
                        isGabarito
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <span className="font-bold text-white">
                        {letra.toUpperCase()}){' '}
                      </span>
                      <span
                        className={
                          isGabarito ? 'text-emerald-400' : 'text-gray-300'
                        }
                      >
                        {alternativa}
                      </span>
                      {isGabarito && (
                        <span className="ml-2 text-xs text-emerald-500">
                          (Gabarito)
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
              {formData.explicacao && (
                <div className="mt-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                  <p className="mb-2 text-sm font-semibold text-blue-400">
                    Explicação:
                  </p>
                  <p className="text-sm text-gray-300">{formData.explicacao}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
