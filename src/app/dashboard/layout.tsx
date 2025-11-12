import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O middleware já garante que só usuários autenticados chegam aqui
  // Mas mantemos verificação por segurança
  if (!user) {
    return null;
  }

  // Buscar dados do perfil (plano, gamificação, etc.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, pontos_totais, nivel, streak_dias')
    .eq('id', user.id)
    .single();

  const plano = profile?.plano || 'free';
  const pontosTotais = profile?.pontos_totais || 0;
  const nivel = profile?.nivel || 1;
  const streakDias = profile?.streak_dias || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <Sidebar plano={plano} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          plano={plano}
          pontosTotais={pontosTotais}
          nivel={nivel}
          streakDias={streakDias}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black via-slate-950 to-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
