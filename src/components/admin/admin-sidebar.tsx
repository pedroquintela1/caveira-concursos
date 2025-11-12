'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileQuestion,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Settings,
  Users,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Tag,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Questões',
    href: '/admin/questoes',
    icon: FileQuestion,
  },
  {
    label: 'Leis e Artigos',
    href: '/admin/leis',
    icon: BookOpen,
  },
  {
    label: 'Mnemônicos',
    href: '/admin/mnemonicos',
    icon: Lightbulb,
  },
  {
    label: 'Comentários',
    href: '/admin/comentarios',
    icon: MessageSquare,
  },
];

const configItems: NavItem[] = [
  {
    label: 'Disciplinas',
    href: '/admin/configuracoes/disciplinas',
    icon: BookOpen,
  },
  {
    label: 'Bancas',
    href: '/admin/configuracoes/bancas',
    icon: Briefcase,
  },
  {
    label: 'Órgãos',
    href: '/admin/configuracoes/orgaos',
    icon: Building2,
  },
  {
    label: 'Áreas Carreira',
    href: '/admin/configuracoes/areas-carreira',
    icon: Briefcase,
  },
  {
    label: 'Formações',
    href: '/admin/configuracoes/formacoes',
    icon: GraduationCap,
  },
  {
    label: 'Assuntos',
    href: '/admin/configuracoes/assuntos',
    icon: List,
  },
];

const systemItems: NavItem[] = [
  {
    label: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    label: 'Financeiro',
    href: '/admin/financeiro',
    icon: TrendingUp,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 overflow-y-auto border-r border-gray-800 bg-gray-950">
      {/* Logo */}
      <div className="border-b border-gray-800 p-6">
        <h1 className="text-xl font-bold text-white">KAV Admin</h1>
        <p className="mt-1 text-xs text-gray-400">Painel Administrativo</p>
      </div>

      {/* Navegação Principal */}
      <nav className="space-y-1 p-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Conteúdo
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Configurações */}
      <nav className="space-y-1 border-t border-gray-800 p-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Configurações
        </p>
        {configItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sistema */}
      <nav className="space-y-1 border-t border-gray-800 p-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sistema
        </p>
        {systemItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
