'use client';

import { Bell, Search, User, LogOut, Settings, ChevronDown, Trophy, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      nome?: string;
      avatar_url?: string;
    };
  };
  plano: string;
  pontosTotais: number;
  nivel: number;
  streakDias: number;
}

export function Header({ user, plano, pontosTotais, nivel, streakDias }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Config de cores dos planos
  const planoConfig = {
    free: { label: 'FREE', color: '#8fbc8f', bgColor: 'bg-[#8fbc8f]/20' },
    basic: { label: 'BASIC', color: '#60a5fa', bgColor: 'bg-blue-500/20' },
    premium: { label: 'PREMIUM', color: '#f59e0b', bgColor: 'bg-amber-500/20' },
  };

  const planoCfg = planoConfig[plano as keyof typeof planoConfig] || planoConfig.free;

  // Calcular progresso para próximo nível (sistema exponencial: nivel * 100 pontos por nível)
  const pontosProximoNivel = nivel * 100;
  const pontosAtualNivel = (nivel - 1) * 100;
  const progressoNivel = Math.min(
    ((pontosTotais - pontosAtualNivel) / (pontosProximoNivel - pontosAtualNivel)) * 100,
    100
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900/50 px-6 backdrop-blur-sm z-50">
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar questões, leis, artigos..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 relative z-50">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-800"
        >
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#8fbc8f]" />
        </Button>

        {/* Gamificação Stats */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          {/* Level */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
            <Trophy className="h-4 w-4 text-[#8fbc8f]" />
            <div>
              <p className="text-xs text-gray-500">Nível</p>
              <p className="text-sm font-bold text-white">{nivel}</p>
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
            <Zap className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-500">XP</p>
              <p className="text-sm font-bold text-white">{pontosTotais}</p>
            </div>
          </div>

          {/* Streak */}
          {streakDias > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Sequência</p>
                <p className="text-sm font-bold text-white">{streakDias}d</p>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative z-[100]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-lg hover:bg-gray-800/50 px-2 py-1 transition-colors relative z-[100]"
          >
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-0.5">
                <p className="text-sm font-medium text-white">
                  {user.user_metadata?.nome || 'Usuário'}
                </p>
                {/* Badge do Plano */}
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: planoCfg.color + '30',
                    color: planoCfg.color,
                    border: `1px solid ${planoCfg.color}50`,
                  }}
                >
                  {planoCfg.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{user.email?.split('@')[0]}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-gray-900" style={{ backgroundColor: planoCfg.color }}>
              {user.user_metadata?.nome?.[0]?.toUpperCase() || (
                <User className="h-5 w-5" />
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Menu - FIXED para não ser cortado pelo overflow-hidden */}
              <div className="fixed right-6 top-16 w-56 rounded-lg border border-gray-800 bg-gray-900 shadow-2xl z-[9999]">
                {/* User Info */}
                <div className="border-b border-gray-800 px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    {user.user_metadata?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/dashboard/configuracoes');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Configurações
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
