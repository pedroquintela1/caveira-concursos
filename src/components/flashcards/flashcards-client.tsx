'use client';

import { useState } from 'react';
import { Plus, BookMarked, Calendar, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CriarFlashcardModal } from './criar-flashcard-modal';
import { PaywallCard } from '@/components/ui/paywall-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  frente: string;
  verso: string;
  disciplina?: string;
  tags?: string[];
  proxima_revisao: string;
  intervalo_dias: number;
  facilidade: number;
  created_at: string;
}

interface FlashcardsClientProps {
  flashcards: Flashcard[];
  plano: 'free' | 'basic' | 'premium';
  userId: string;
}

const LIMITES = {
  free: { max_flashcards: 30 },
  basic: { max_flashcards: 200 },
  premium: { max_flashcards: Infinity },
};

export function FlashcardsClient({
  flashcards: initialFlashcards,
  plano,
  userId,
}: FlashcardsClientProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limite = LIMITES[plano];
  const podeCrearMais = flashcards.length < limite.max_flashcards;

  const hoje = new Date();
  const paraRevisar = flashcards.filter(
    (f) => new Date(f.proxima_revisao) <= hoje
  ).length;

  const filteredFlashcards = flashcards.filter(
    (f) =>
      f.frente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.verso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.disciplina?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/flashcards/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashcards(flashcards.filter((f) => f.id !== deleteId));
        toast.success('Flashcard excluído', {
          description: 'O flashcard foi excluído com sucesso',
        });
      } else {
        toast.error('Erro ao excluir', {
          description: 'Não foi possível excluir o flashcard',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error);
      toast.error('Erro ao excluir', {
        description: 'Ocorreu um erro ao excluir o flashcard',
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
            Flashcards
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Sistema de repetição espaçada para memorização eficiente
          </p>
        </div>

        <div className="flex gap-2">
          {paraRevisar > 0 && (
            <Link href="/dashboard/flashcards/revisar">
              <Button className="bg-[#8fbc8f] hover:bg-[#7da87d]">
                <BookMarked className="mr-2 h-4 w-4" />
                Revisar ({paraRevisar})
              </Button>
            </Link>
          )}

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!podeCrearMais}
            variant={paraRevisar > 0 ? 'outline' : 'default'}
            className={
              paraRevisar > 0
                ? 'border-gray-700 text-white hover:bg-gray-800'
                : 'bg-[#8fbc8f] hover:bg-[#7da87d]'
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Flashcard
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#8fbc8f]/20 p-2">
              <BookMarked className="h-5 w-5 text-[#8fbc8f]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="font-saira text-2xl font-bold text-white">
                {flashcards.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Para Revisar</p>
              <p className="font-saira text-2xl font-bold text-white">
                {paraRevisar}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <BookMarked className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Limite</p>
              <p className="font-saira text-2xl font-bold text-white">
                {limite.max_flashcards === Infinity
                  ? '∞'
                  : limite.max_flashcards}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <BookMarked className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Disponíveis</p>
              <p className="font-saira text-2xl font-bold text-white">
                {limite.max_flashcards === Infinity
                  ? '∞'
                  : limite.max_flashcards - flashcards.length}
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
            placeholder="Buscar flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-800 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {!podeCrearMais && (
        <PaywallCard
          planoAtual={plano}
          recursoNecessario={plano === 'free' ? 'basic' : 'premium'}
          descricao={`Você atingiu o limite de ${limite.max_flashcards} flashcards do plano ${plano.toUpperCase()}. Faça upgrade para criar mais!`}
        />
      )}

      {/* Lista de Flashcards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFlashcards.map((flashcard) => {
          const precisaRevisar = new Date(flashcard.proxima_revisao) <= hoje;

          return (
            <Card
              key={flashcard.id}
              className="border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-[#8fbc8f]/50"
            >
              {precisaRevisar && (
                <Badge className="mb-3 bg-orange-500/20 text-orange-400">
                  Revisar hoje
                </Badge>
              )}

              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500">FRENTE</p>
                <p className="mt-1 line-clamp-2 text-sm text-white">
                  {flashcard.frente}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500">VERSO</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {flashcard.verso}
                </p>
              </div>

              {flashcard.disciplina && (
                <Badge className="mb-3 bg-[#8fbc8f]/20 text-[#8fbc8f]">
                  {flashcard.disciplina}
                </Badge>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
                <div>
                  <p className="text-xs text-gray-500">Próxima revisão</p>
                  <p className="text-xs font-semibold text-gray-400">
                    {new Date(flashcard.proxima_revisao).toLocaleDateString(
                      'pt-BR'
                    )}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(flashcard.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredFlashcards.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <BookMarked className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 font-saira text-lg font-semibold text-gray-400">
            {searchTerm
              ? 'Nenhum flashcard encontrado'
              : 'Nenhum flashcard criado ainda'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? 'Tente buscar por outros termos'
              : 'Crie seu primeiro flashcard para começar a estudar!'}
          </p>
        </div>
      )}

      <CriarFlashcardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onFlashcardCreated={(newFlashcard) => {
          setFlashcards([newFlashcard, ...flashcards]);
          setIsModalOpen(false);
        }}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Excluir flashcard"
        description="Tem certeza que deseja excluir este flashcard?\n\nEsta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </>
  );
}
