'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CriarFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onFlashcardCreated: (flashcard: any) => void;
}

export function CriarFlashcardModal({
  isOpen,
  onClose,
  userId,
  onFlashcardCreated,
}: CriarFlashcardModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    frente: '',
    verso: '',
    disciplina: '',
    tags: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          user_id: userId,
        }),
      });

      if (response.ok) {
        const newFlashcard = await response.json();
        onFlashcardCreated(newFlashcard);
        setFormData({ frente: '', verso: '', disciplina: '', tags: '' });
      }
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-saira text-2xl font-bold text-white">
            Criar Novo Flashcard
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="frente" className="text-white">
              Frente (Pergunta)
            </Label>
            <Textarea
              id="frente"
              value={formData.frente}
              onChange={(e) =>
                setFormData({ ...formData, frente: e.target.value })
              }
              placeholder="Ex: Quais são os princípios da Administração Pública?"
              rows={3}
              required
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div>
            <Label htmlFor="verso" className="text-white">
              Verso (Resposta)
            </Label>
            <Textarea
              id="verso"
              value={formData.verso}
              onChange={(e) =>
                setFormData({ ...formData, verso: e.target.value })
              }
              placeholder="Ex: LIMPE - Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência"
              rows={4}
              required
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div>
            <Label htmlFor="disciplina" className="text-white">
              Disciplina (opcional)
            </Label>
            <Input
              id="disciplina"
              value={formData.disciplina}
              onChange={(e) =>
                setFormData({ ...formData, disciplina: e.target.value })
              }
              placeholder="Ex: Direito Administrativo"
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="text-white">
              Tags (separadas por vírgula)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="Ex: princípios, CF88, importante"
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-800 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#8fbc8f] hover:bg-[#7da87d]"
            >
              {isSubmitting ? 'Criando...' : 'Criar Flashcard'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
