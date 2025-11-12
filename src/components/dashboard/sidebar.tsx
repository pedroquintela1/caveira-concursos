'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Notebook,
  Trophy,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useState } from 'react';

interface SidebarProps {
  plano: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Estudo da Lei Seca',
    href: '/dashboard/leis',
    icon: BookOpen,
  },
  {
    title: 'Cadernos',
    href: '/dashboard/cadernos',
    icon: Notebook,
  },
  {
    title: 'Ranking',
    href: '/dashboard/ranking',
    icon: Trophy,
  },
  {
    title: 'Análise de Bancas',
    href: '/dashboard/bancas',
    icon: TrendingUp,
  },
  {
    title: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
];

export function Sidebar({ plano }: SidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mensagens dinâmicas por plano
  const planoConfig = {
    free: {
      label: 'FREE',
      message: 'Upgrade para Premium e tenha acesso ilimitado!',
      color: '#8fbc8f',
    },
    basic: {
      label: 'BASIC',
      message: 'Aproveite os benefícios do plano BASIC!',
      color: '#60a5fa',
    },
    premium: {
      label: 'PREMIUM',
      message: 'Você tem acesso total à plataforma!',
      color: '#f59e0b',
    },
  };

  const config = planoConfig[plano as keyof typeof planoConfig] || planoConfig.free;

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
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-800 lg:bg-gray-900/50 lg:backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#8fbc8f]" />
          <span className="font-saira text-xl font-bold text-white">
            KAV CONCURSOS
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'border-l-2 border-[#8fbc8f] bg-[#8fbc8f]/20 text-[#8fbc8f]'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-gray-800/50 hover:text-red-300 transition-all disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </nav>

      {/* Plano Info */}
      <div className="border-t border-gray-800 p-4">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: `${config.color}30`,
            background: `linear-gradient(to bottom right, ${config.color}20, ${config.color}10)`,
          }}
        >
          <p
            className="font-saira text-sm font-bold"
            style={{ color: config.color }}
          >
            Plano {config.label}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {config.message}
          </p>
          {plano !== 'premium' && (
            <Link
              href="/dashboard/assinatura"
              className="mt-3 block w-full rounded-md px-3 py-2 text-center text-sm font-bold text-gray-900 transition-all hover:scale-105"
              style={{
                backgroundColor: config.color,
              }}
            >
              {plano === 'free' ? 'Ver Planos' : 'Fazer Upgrade'}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
