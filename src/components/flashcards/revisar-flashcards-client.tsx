'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Flashcard {
  id: string;
  frente: string;
  verso: string;
  disciplina?: string;
  intervalo_dias: number;
  facilidade: number;
}

interface RevisarFlashcardsClientProps {
  flashcards: Flashcard[];
  userId: string;
}

export function RevisarFlashcardsClient({
  flashcards: initialFlashcards,
  userId,
}: RevisarFlashcardsClientProps) {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVerso, setShowVerso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
        <Check className="mx-auto h-16 w-16 text-[#8fbc8f]" />
        <h2 className="mt-4 font-saira text-2xl font-bold text-white">
          Parabéns!
        </h2>
        <p className="mt-2 text-gray-400">
          Você não tem flashcards para revisar no momento.
        </p>
        <Button
          onClick={() => router.push('/dashboard/flashcards')}
          className="mt-6 bg-[#8fbc8f] hover:bg-[#7da87d]"
        >
          Voltar para Flashcards
        </Button>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];
  const progress = ((currentIndex) / flashcards.length) * 100;

  const handleResposta = async (qualidade: 0 | 1 | 2 | 3) => {
    // 0: Não lembrei, 1: Difícil, 2: Bom, 3: Fácil
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/flashcards/${currentFlashcard.id}/revisar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qualidade }),
        }
      );

      if (response.ok) {
        if (currentIndex === flashcards.length - 1) {
          // Última revisão, redirecionar
          router.push('/dashboard/flashcards');
        } else {
          // Próximo flashcard
          setCurrentIndex(currentIndex + 1);
          setShowVerso(false);
        }
      }
    } catch (error) {
      console.error('Erro ao registrar revisão:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-saira text-2xl font-bold text-white">
            Revisão de Flashcards
          </h1>
          <Badge className="bg-[#8fbc8f]/20 text-[#8fbc8f]">
            {currentIndex + 1} / {flashcards.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full bg-[#8fbc8f] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="border-gray-800 bg-gray-900/50 p-8">
        {currentFlashcard.disciplina && (
          <Badge className="mb-4 bg-blue-500/20 text-blue-400">
            {currentFlashcard.disciplina}
          </Badge>
        )}

        {/* Frente */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold text-gray-500">PERGUNTA</p>
          <p className="text-xl text-white">{currentFlashcard.frente}</p>
        </div>

        {/* Verso (mostrar quando clicar em "Mostrar Resposta") */}
        {showVerso && (
          <div className="mb-8 rounded-lg border border-gray-800 bg-gray-950 p-6">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              RESPOSTA
            </p>
            <p className="text-lg text-gray-300">{currentFlashcard.verso}</p>
          </div>
        )}

        {/* Botões */}
        {!showVerso ? (
          <Button
            onClick={() => setShowVerso(true)}
            className="w-full bg-[#8fbc8f] hover:bg-[#7da87d]"
          >
            Mostrar Resposta
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-400">
              Como foi sua lembrança?
            </p>

            <div className="grid gap-2 sm:grid-cols-4">
              <Button
                onClick={() => handleResposta(0)}
                disabled={isSubmitting}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Não lembrei
              </Button>

              <Button
                onClick={() => handleResposta(1)}
                disabled={isSubmitting}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
              >
                Difícil
              </Button>

              <Button
                onClick={() => handleResposta(2)}
                disabled={isSubmitting}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                Bom
              </Button>

              <Button
                onClick={() => handleResposta(3)}
                disabled={isSubmitting}
                className="bg-[#8fbc8f] hover:bg-[#7da87d]"
              >
                Fácil
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/flashcards')}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Cancelar Revisão
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setShowVerso(false);
            setCurrentIndex(0);
          }}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </>
  );
}
