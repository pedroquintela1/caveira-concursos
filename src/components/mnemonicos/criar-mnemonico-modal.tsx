'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CriarMnemonicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onMnemonicoCreated: (mnemonico: any) => void;
}

export function CriarMnemonicoModal({
  isOpen,
  onClose,
  userId,
  onMnemonicoCreated,
}: CriarMnemonicoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    lei: '',
    artigo: '',
    tags: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mnemonicos', {
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
        const newMnemonico = await response.json();
        onMnemonicoCreated(newMnemonico);
        setFormData({ titulo: '', conteudo: '', lei: '', artigo: '', tags: '' });
      }
    } catch (error) {
      console.error('Erro ao criar mnemônico:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-saira text-2xl font-bold text-white">
            Criar Novo Mnemônico
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
            <Label htmlFor="titulo" className="text-white">
              Título do Mnemônico
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Ex: Princípios da Administração Pública"
              required
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lei" className="text-white">
                Lei/Norma
              </Label>
              <Input
                id="lei"
                value={formData.lei}
                onChange={(e) =>
                  setFormData({ ...formData, lei: e.target.value })
                }
                placeholder="Ex: CF/88"
                required
                className="border-gray-800 bg-gray-950 text-white"
              />
            </div>

            <div>
              <Label htmlFor="artigo" className="text-white">
                Artigo (opcional)
              </Label>
              <Input
                id="artigo"
                value={formData.artigo}
                onChange={(e) =>
                  setFormData({ ...formData, artigo: e.target.value })
                }
                placeholder="Ex: 37"
                className="border-gray-800 bg-gray-950 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="conteudo" className="text-white">
              Conteúdo do Mnemônico
            </Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) =>
                setFormData({ ...formData, conteudo: e.target.value })
              }
              placeholder="Ex: LIMPE - Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência"
              rows={6}
              required
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
              placeholder="Ex: direito administrativo, princípios, CF88"
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
              {isSubmitting ? 'Criando...' : 'Criar Mnemônico'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
