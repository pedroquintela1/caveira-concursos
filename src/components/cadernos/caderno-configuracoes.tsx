'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Download, Printer, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gerarPDFCaderno } from '@/lib/pdf-generator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface CadernoConfiguracoesProps {
  cadernoId: number;
}

export function CadernoConfiguracoes({ cadernoId }: CadernoConfiguracoesProps) {
  const [atualizando, setAtualizando] = useState(false);
  const [codigosQuestoes, setCodigosQuestoes] = useState('');

  // Configurações de Impressão
  const [qtdMaxima, setQtdMaxima] = useState(200);
  const [inicioImpressao, setInicioImpressao] = useState<
    'a-partir' | 'aleatoriamente'
  >('a-partir');
  const [questaoInicial, setQuestaoInicial] = useState(1);
  const [tamanhoFonte, setTamanhoFonte] = useState<
    'normal' | 'grande' | 'extra-grande'
  >('normal');
  const [imprimirCabecalho, setImprimirCabecalho] = useState<
    'com-materia' | 'sem-materia' | 'nao-imprimir'
  >('com-materia');
  const [imprimirGabaritos, setImprimirGabaritos] = useState<
    'fim' | 'junto' | 'nao-imprimir'
  >('fim');
  const [removerQuestoes, setRemoverQuestoes] = useState<
    'nenhuma' | 'resolvi' | 'acertei' | 'nao-favoritas'
  >('nenhuma');
  const [imprimirTexto, setImprimirTexto] = useState(true);
  const [espacoRascunho, setEspacoRascunho] = useState<
    'nao' | 'lateral' | 'entre-questoes' | 'entre-alternativas'
  >('nao');
  const [imprimirQRCode, setImprimirQRCode] = useState(false);

  const handleAtualizarQuestoes = async () => {
    setAtualizando(true);
    try {
      // TODO: Implementar lógica de atualização
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação
      alert('Questões atualizadas com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar questões');
    } finally {
      setAtualizando(false);
    }
  };

  const handleAdicionarPorCodigo = async () => {
    if (!codigosQuestoes.trim()) {
      alert('Digite os códigos das questões');
      return;
    }
    // TODO: Implementar lógica
    alert(`Adicionando questões com códigos: ${codigosQuestoes}`);
  };

  const handleImprimirCaderno = async () => {
    try {
      toast.info('Gerando PDF...', { description: 'Por favor, aguarde' });

      const supabase = createClient();

      // Buscar informações do caderno
      const { data: caderno, error: cadernoError } = await supabase
        .from('cadernos')
        .select('nome, user_id')
        .eq('id', cadernoId)
        .single();

      if (cadernoError || !caderno) {
        toast.error('Erro ao buscar caderno');
        return;
      }

      // Buscar questões do caderno via RPC
      const { data: questoes, error: questoesError } = await supabase.rpc(
        'get_caderno_questoes',
        {
          p_caderno_id: cadernoId,
          p_user_id: caderno.user_id,
        }
      );

      if (questoesError || !questoes || questoes.length === 0) {
        toast.error('Erro ao buscar questões', {
          description: 'Nenhuma questão encontrada para este caderno',
        });
        return;
      }

      // Gerar PDF
      await gerarPDFCaderno(questoes, caderno.nome, {
        qtdMaxima,
        inicioImpressao,
        questaoInicial,
        tamanhoFonte,
        imprimirCabecalho,
        imprimirGabaritos,
        removerQuestoes,
        espacoRascunho,
        imprimirQRCode,
      });

      toast.success('PDF gerado com sucesso!', {
        description: 'O download foi iniciado automaticamente',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF', {
        description: 'Tente novamente em alguns instantes',
      });
    }
  };

  const getResumoImpressao = () => {
    return `Serão impressas no máximo ${qtdMaxima} questões`;
  };

  return (
    <div className="space-y-6">
      {/* Atualização de Questões */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <RefreshCw className="h-5 w-5" />
            Atualização de questões
          </CardTitle>
          <CardDescription className="text-gray-400">
            Esta opção verifica a existência de novas questões que atendam aos
            filtros que você escolheu e as adiciona neste caderno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Última Atualização do caderno:{' '}
              <span className="font-medium text-white">29/09/2025</span>
            </div>
            <Button
              onClick={handleAtualizarQuestoes}
              disabled={atualizando}
              className="bg-[#8fbc8f] font-semibold text-gray-900 hover:bg-[#7dad7d]"
            >
              {atualizando ? 'Atualizando...' : 'VERIFICAR ATUALIZAÇÕES'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Atualização de Resoluções */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Download className="h-5 w-5" />
            Atualização de resoluções
          </CardTitle>
          <CardDescription className="text-gray-400">
            Esta opção importa a sua resposta mais recente no caso de você ter
            resolvido alguma questão deste caderno em outros meios (outros
            cadernos, bibliotecas, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Última Atualização:{' '}
              <span className="font-medium text-white">Nunca</span>
            </div>
            <Button className="bg-[#8fbc8f] font-semibold text-gray-900 hover:bg-[#7dad7d]">
              ATUALIZAR RESOLUÇÕES
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adicionar Questões por Código */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Tag className="h-5 w-5" />
            Adicionar questões por código
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Adicione os códigos das questões separados por espaço"
            value={codigosQuestoes}
            onChange={(e) => setCodigosQuestoes(e.target.value)}
            className="border-gray-700 bg-gray-800 text-white"
          />
          <Button
            onClick={handleAdicionarPorCodigo}
            className="bg-[#8fbc8f] font-semibold text-gray-900 hover:bg-[#7dad7d]"
          >
            ADICIONAR QUESTÃO
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Impressão */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Printer className="h-5 w-5" />
            Configurações de Impressão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quantidade Máxima */}
          <div>
            <Label className="mb-3 block text-white">
              Quantidade máxima de questões:{' '}
              <span className="font-bold">{qtdMaxima}</span>
            </Label>
            <Slider
              value={[qtdMaxima]}
              onValueChange={(value) => setQtdMaxima(value[0])}
              max={500}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          {/* Início da Impressão */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3 block text-white">
                Início da impressão
              </Label>
              <RadioGroup
                value={inicioImpressao}
                onValueChange={(v: any) => setInicioImpressao(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a-partir" id="a-partir" />
                  <label
                    htmlFor="a-partir"
                    className="cursor-pointer text-sm text-white"
                  >
                    A partir da questão:
                  </label>
                  <Input
                    type="number"
                    value={questaoInicial}
                    onChange={(e) =>
                      setQuestaoInicial(parseInt(e.target.value) || 1)
                    }
                    className="w-20 border-gray-700 bg-gray-800 text-white"
                    min={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aleatoriamente" id="aleatoriamente" />
                  <label
                    htmlFor="aleatoriamente"
                    className="cursor-pointer text-sm text-white"
                  >
                    Aleatoriamente
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Tamanho da Fonte */}
            <div>
              <Label className="mb-3 block text-white">Tamanho da fonte</Label>
              <RadioGroup
                value={tamanhoFonte}
                onValueChange={(v: any) => setTamanhoFonte(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <label
                    htmlFor="normal"
                    className="cursor-pointer text-sm text-white"
                  >
                    Normal
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grande" id="grande" />
                  <label
                    htmlFor="grande"
                    className="cursor-pointer text-sm text-white"
                  >
                    Grande
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extra-grande" id="extra-grande" />
                  <label
                    htmlFor="extra-grande"
                    className="cursor-pointer text-sm text-white"
                  >
                    Extra grande
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Imprimir Cabeçalho & Gabaritos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3 block text-white">
                Imprimir cabeçalho da questão
              </Label>
              <RadioGroup
                value={imprimirCabecalho}
                onValueChange={(v: any) => setImprimirCabecalho(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="com-materia" id="com-materia" />
                  <label
                    htmlFor="com-materia"
                    className="cursor-pointer text-sm text-white"
                  >
                    Com matéria e assunto
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sem-materia" id="sem-materia" />
                  <label
                    htmlFor="sem-materia"
                    className="cursor-pointer text-sm text-white"
                  >
                    Sem matéria e assunto
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao-imprimir" id="nao-imprimir" />
                  <label
                    htmlFor="nao-imprimir"
                    className="cursor-pointer text-sm text-white"
                  >
                    Não imprimir
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block text-white">
                Imprimir gabaritos
              </Label>
              <RadioGroup
                value={imprimirGabaritos}
                onValueChange={(v: any) => setImprimirGabaritos(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fim" id="fim" />
                  <label
                    htmlFor="fim"
                    className="cursor-pointer text-sm text-white"
                  >
                    No fim do caderno
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="junto" id="junto" />
                  <label
                    htmlFor="junto"
                    className="cursor-pointer text-sm text-white"
                  >
                    Junto com cada questão
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao-imprimir" id="nao-imprimir-gab" />
                  <label
                    htmlFor="nao-imprimir-gab"
                    className="cursor-pointer text-sm text-white"
                  >
                    Não imprimir
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Remover Questões & Espaço Rascunho */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3 block text-white">Remover questões</Label>
              <RadioGroup
                value={removerQuestoes}
                onValueChange={(v: any) => setRemoverQuestoes(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nenhuma" id="nenhuma" />
                  <label
                    htmlFor="nenhuma"
                    className="cursor-pointer text-sm text-white"
                  >
                    Nenhuma
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resolvi" id="resolvi" />
                  <label
                    htmlFor="resolvi"
                    className="cursor-pointer text-sm text-white"
                  >
                    As que resolvi
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acertei" id="acertei" />
                  <label
                    htmlFor="acertei"
                    className="cursor-pointer text-sm text-white"
                  >
                    As que acertei
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao-favoritas" id="nao-favoritas" />
                  <label
                    htmlFor="nao-favoritas"
                    className="cursor-pointer text-sm text-white"
                  >
                    Não favoritas
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block text-white">
                Espaço para rascunho
              </Label>
              <RadioGroup
                value={espacoRascunho}
                onValueChange={(v: any) => setEspacoRascunho(v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="nao-rascunho" />
                  <label
                    htmlFor="nao-rascunho"
                    className="cursor-pointer text-sm text-white"
                  >
                    Não
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lateral" id="lateral" />
                  <label
                    htmlFor="lateral"
                    className="cursor-pointer text-sm text-white"
                  >
                    Lateral
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entre-questoes" id="entre-questoes" />
                  <label
                    htmlFor="entre-questoes"
                    className="cursor-pointer text-sm text-white"
                  >
                    Entre questões
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="entre-alternativas"
                    id="entre-alternativas"
                  />
                  <label
                    htmlFor="entre-alternativas"
                    className="cursor-pointer text-sm text-white"
                  >
                    Entre alternativas
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Resumo & Botão Imprimir */}
          <div className="mt-6 border-t border-gray-800 pt-6">
            <div className="mb-4 rounded-lg bg-gray-800/50 p-4">
              <p className="text-sm text-gray-400">Resumo da impressão</p>
              <p className="text-lg font-bold text-white">
                {getResumoImpressao()}
              </p>
            </div>
            <Button
              onClick={handleImprimirCaderno}
              size="lg"
              className="w-full bg-[#8fbc8f] py-6 font-bold text-gray-900 hover:bg-[#7dad7d]"
            >
              <Printer className="mr-2 h-5 w-5" />
              IMPRIMIR CADERNO
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
