import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PlanosClient } from '@/components/planos/planos-client';

export const metadata = {
  title: 'Planos | KAV Concursos',
  description: 'Escolha o melhor plano para seus estudos',
};

export default async function PlanosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PlanosClient planoAtual={profile?.plano || 'free'} />
      </div>
    </div>
  );
}
