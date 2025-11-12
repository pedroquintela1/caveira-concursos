import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MnemonicosClient } from '@/components/mnemonicos/mnemonicos-client';

export const metadata = {
  title: 'Mnemônicos | KAV Concursos',
  description: 'Crie e gerencie técnicas de memorização para leis',
};

export default async function MnemonicosPage() {
  const supabase = createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single();

  // Buscar mnemônicos do usuário
  const { data: mnemonicos } = await supabase
    .from('mnemonicos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MnemonicosClient
          mnemonicos={mnemonicos || []}
          plano={profile?.plano || 'free'}
          userId={user.id}
        />
      </div>
    </div>
  );
}
