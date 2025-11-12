import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FlashcardsClient } from '@/components/flashcards/flashcards-client';

export const metadata = {
  title: 'Flashcards | KAV Concursos',
  description: 'Sistema de repetição espaçada para memorização eficiente',
};

export default async function FlashcardsPage() {
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

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id)
    .order('proxima_revisao', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FlashcardsClient
          flashcards={flashcards || []}
          plano={profile?.plano || 'free'}
          userId={user.id}
        />
      </div>
    </div>
  );
}
