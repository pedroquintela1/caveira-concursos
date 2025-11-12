'use client';

import { useState } from 'react';
import { Plus, Brain, Trash2, Edit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CriarMnemonicoModal } from './criar-mnemonico-modal';
import { PaywallCard } from '@/components/ui/paywall-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Mnemonico {
  id: string;
  titulo: string;
  conteudo: string;
  lei: string;
  artigo?: string;
  tags?: string[];
  created_at: string;
}

interface MnemonicosClientProps {
  mnemonicos: Mnemonico[];
  plano: 'free' | 'basic' | 'premium';
  userId: string;
}

const LIMITES = {
  free: { max_mnemonicos: 10 },
  basic: { max_mnemonicos: 50 },
  premium: { max_mnemonicos: Infinity },
};

export function MnemonicosClient({
  mnemonicos: initialMnemonicos,
  plano,
  userId,
}: MnemonicosClientProps) {
  const [mnemonicos, setMnemonicos] = useState(initialMnemonicos);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limite = LIMITES[plano];
  const podeCrearMais = mnemonicos.length < limite.max_mnemonicos;

  const filteredMnemonicos = mnemonicos.filter(
    (m) =>
      m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mnemonicos/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMnemonicos(mnemonicos.filter((m) => m.id !== deleteId));
        toast.success('Mnemônico excluído', {
          description: 'O mnemônico foi excluído com sucesso',
        });
      } else {
        toast.error('Erro ao excluir', {
          description: 'Não foi possível excluir o mnemônico',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar mnemônico:', error);
      toast.error('Erro ao excluir', {
        description: 'Ocorreu um erro ao excluir o mnemônico',
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-saira text-3xl font-bold text-white">
            Mnemônicos
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Crie técnicas de memorização para facilitar seus estudos
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={!podeCrearMais}
          className="bg-[#8fbc8f] hover:bg-[#7da87d]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Mnemônico
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#8fbc8f]/20 p-2">
              <Brain className="h-5 w-5 text-[#8fbc8f]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="font-saira text-2xl font-bold text-white">
                {mnemonicos.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Brain className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Limite do Plano</p>
              <p className="font-saira text-2xl font-bold text-white">
                {limite.max_mnemonicos === Infinity
                  ? '∞'
                  : limite.max_mnemonicos}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Disponíveis</p>
              <p className="font-saira text-2xl font-bold text-white">
                {limite.max_mnemonicos === Infinity
                  ? '∞'
                  : limite.max_mnemonicos - mnemonicos.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar mnemônicos por título, lei ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-800 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Paywall if limit reached */}
      {!podeCrearMais && (
        <PaywallCard
          planoAtual={plano}
          recursoNecessario={plano === 'free' ? 'basic' : 'premium'}
          descricao={`Você atingiu o limite de ${limite.max_mnemonicos} mnemônicos do plano ${plano.toUpperCase()}. Faça upgrade para criar mais!`}
        />
      )}

      {/* Lista de Mnemônicos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMnemonicos.map((mnemonico) => (
          <Card
            key={mnemonico.id}
            className="border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-[#8fbc8f]/50"
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-saira text-lg font-bold text-white">
                {mnemonico.titulo}
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(mnemonico.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <Badge className="bg-[#8fbc8f]/20 text-[#8fbc8f]">
                {mnemonico.lei}
                {mnemonico.artigo && ` - Art. ${mnemonico.artigo}`}
              </Badge>
            </div>

            <p className="mb-4 line-clamp-3 text-sm text-gray-400">
              {mnemonico.conteudo}
            </p>

            {mnemonico.tags && mnemonico.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mnemonico.tags.slice(0, 3).map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-gray-700 text-xs text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Criado em{' '}
                {new Date(mnemonico.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {filteredMnemonicos.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 font-saira text-lg font-semibold text-gray-400">
            {searchTerm
              ? 'Nenhum mnemônico encontrado'
              : 'Nenhum mnemônico criado ainda'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? 'Tente buscar por outros termos'
              : 'Crie seu primeiro mnemônico para facilitar a memorização!'}
          </p>
        </div>
      )}

      <CriarMnemonicoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onMnemonicoCreated={(newMnemonico) => {
          setMnemonicos([newMnemonico, ...mnemonicos]);
          setIsModalOpen(false);
        }}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Excluir mnemônico"
        description="Tem certeza que deseja excluir este mnemônico?\n\nEsta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </>
  );
}
