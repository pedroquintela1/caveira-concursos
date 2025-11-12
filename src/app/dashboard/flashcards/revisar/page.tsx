import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RevisarFlashcardsClient } from '@/components/flashcards/revisar-flashcards-client';

export const metadata = {
  title: 'Revisar Flashcards | KAV Concursos',
  description: 'Revisar flashcards pendentes',
};

export default async function RevisarFlashcardsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar flashcards que precisam de revisão (proxima_revisao <= hoje)
  const hoje = new Date().toISOString();

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id)
    .lte('proxima_revisao', hoje)
    .order('proxima_revisao', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <RevisarFlashcardsClient
          flashcards={flashcards || []}
          userId={user.id}
        />
      </div>
    </div>
  );
}
