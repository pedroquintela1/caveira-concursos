'use client';

import { useState } from 'react';
import { User, Mail, Shield, Bell, Trash2, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Profile {
  id: string;
  nome: string;
  email?: string;
  plano: 'free' | 'basic' | 'premium';
  pontos_totais: number;
  nivel: number;
  created_at: string;
}

interface ConfiguracoesClientProps {
  profile: Profile | null;
  userEmail: string;
}

export function ConfiguracoesClient({
  profile: initialProfile,
  userEmail,
}: ConfiguracoesClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [nome, setNome] = useState(profile?.nome || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Preferências de notificação
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifLembrete, setNotifLembrete] = useState(true);
  const [notifRanking, setNotifRanking] = useState(false);

  // Confirmação de exclusão de conta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);

  const handleSavePerfil = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        toast.success('Perfil atualizado', {
          description: 'Suas alterações foram salvas com sucesso',
        });
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      } else {
        toast.error('Erro ao atualizar perfil', {
          description: 'Não foi possível salvar suas alterações',
        });
        setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      toast.error('Erro ao salvar', {
        description: 'Ocorreu um erro ao salvar as alterações',
      });
      setMessage({ type: 'error', text: 'Erro ao salvar alterações' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmFirstDelete = () => {
    setShowDeleteConfirm(false);
    setShowFinalDeleteConfirm(true);
  };

  const handleFinalDeleteAccount = async () => {
    // TODO: Implementar exclusão de conta
    toast.error('Funcionalidade em desenvolvimento', {
      description: 'A exclusão de conta será implementada em breve',
    });
    setShowFinalDeleteConfirm(false);
  };

  const getPlanoColor = (plano: string) => {
    if (plano === 'premium') return 'bg-yellow-500/20 text-yellow-400';
    if (plano === 'basic') return 'bg-blue-500/20 text-blue-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-saira text-3xl font-bold text-white">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Gerencie suas preferências e dados pessoais
        </p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-green-500/30 bg-green-500/10 text-green-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Informações da Conta */}
      <Card className="mb-6 border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="font-saira text-xl font-bold text-white">
            Informações da Conta
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div>
              <p className="text-sm text-gray-400">Plano Atual</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={getPlanoColor(profile?.plano || 'free')}>
                  {profile?.plano?.toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#8fbc8f] text-[#8fbc8f] hover:bg-[#8fbc8f]/20"
              onClick={() => (window.location.href = '/dashboard/planos')}
            >
              Fazer Upgrade
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <p className="text-sm text-gray-400">Pontos Totais</p>
              <p className="mt-1 font-saira text-2xl font-bold text-white">
                {profile?.pontos_totais?.toLocaleString() || 0}
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <p className="text-sm text-gray-400">Nível</p>
              <p className="mt-1 font-saira text-2xl font-bold text-white">
                {profile?.nivel || 1}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
            <p className="text-sm text-gray-400">Membro desde</p>
            <p className="mt-1 text-white">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Dados Pessoais */}
      <Card className="mb-6 border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="font-saira text-xl font-bold text-white">
            Dados Pessoais
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-white">
              Nome
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border-gray-800 bg-gray-950 text-white"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="border-gray-800 bg-gray-950 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              O email não pode ser alterado
            </p>
          </div>

          <Button
            onClick={handleSavePerfil}
            disabled={isSaving || nome === profile?.nome}
            className="bg-[#8fbc8f] hover:bg-[#7da87d]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="mb-6 border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="font-saira text-xl font-bold text-white">
            Notificações
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div>
              <p className="font-semibold text-white">
                Notificações por Email
              </p>
              <p className="text-sm text-gray-400">
                Receba atualizações e novidades por email
              </p>
            </div>
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div>
              <p className="font-semibold text-white">Lembretes de Estudo</p>
              <p className="text-sm text-gray-400">
                Seja lembrado de revisar flashcards
              </p>
            </div>
            <Switch
              checked={notifLembrete}
              onCheckedChange={setNotifLembrete}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div>
              <p className="font-semibold text-white">
                Atualizações de Ranking
              </p>
              <p className="text-sm text-gray-400">
                Receba notificações sobre sua posição no ranking
              </p>
            </div>
            <Switch checked={notifRanking} onCheckedChange={setNotifRanking} />
          </div>
        </div>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-500/30 bg-red-500/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-400" />
          <h2 className="font-saira text-xl font-bold text-red-400">
            Zona de Perigo
          </h2>
        </div>

        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="mb-3 font-semibold text-red-400">Excluir Conta</p>
          <p className="mb-4 text-sm text-gray-300">
            Ao excluir sua conta, todos os seus dados serão permanentemente
            removidos. Esta ação não pode ser desfeita.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Minha Conta
          </Button>
        </div>
      </Card>

      {/* Dialog de Confirmação de Exclusão - Primeira confirmação */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmFirstDelete}
        title="Confirmar exclusão de conta"
        description="Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
        confirmText="Continuar"
        variant="destructive"
      />

      {/* Dialog de Confirmação de Exclusão - Confirmação final */}
      <ConfirmDialog
        open={showFinalDeleteConfirm}
        onOpenChange={setShowFinalDeleteConfirm}
        onConfirm={handleFinalDeleteAccount}
        title="ATENÇÃO: Confirmação final"
        description="Todos os seus dados, cadernos, mnemônicos e flashcards serão perdidos permanentemente.\n\nEsta ação NÃO pode ser desfeita.\n\nDeseja realmente continuar?"
        confirmText="Excluir permanentemente"
        variant="destructive"
      />
    </>
  );
}
