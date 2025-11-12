'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CompartilharCadernoDialogProps {
  cadernoId: number;
  cadernoNome: string;
}

export function CompartilharCadernoDialog({
  cadernoId,
  cadernoNome,
}: CompartilharCadernoDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Gerar link de compartilhamento
  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard/cadernos/${cadernoId}/compartilhado`
      : '';

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiado(true);
      toast.success('Link copiado para a área de transferência!');

      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-600 bg-gray-700 text-white transition-colors hover:bg-gray-600"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Compartilhar caderno
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Compartilhe este caderno "{cadernoNome}" com outras pessoas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Link de Compartilhamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Copie o link abaixo e cole para o destinatário:
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareLink}
                className="flex-1 border-gray-700 bg-gray-800 text-sm text-white"
              />
              <Button
                onClick={handleCopiarLink}
                size="sm"
                className="bg-[#8fbc8f] text-gray-900 hover:bg-[#7dad7d]"
              >
                {copiado ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Botão "Incorporar" (desabilitado por enquanto) */}
          <div className="border-t border-gray-800 pt-4">
            <Button
              variant="outline"
              className="w-full cursor-not-allowed border-gray-700 text-gray-400"
              disabled
            >
              Incorporar
            </Button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Funcionalidade de incorporação em desenvolvimento
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
