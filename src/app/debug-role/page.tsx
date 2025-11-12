import { createClient } from '@/lib/supabase/server';

export default async function DebugRolePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-white">Não autenticado</div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Role</h1>

      <div className="bg-gray-900 p-4 rounded-lg space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Role:</strong> {profile?.role || 'undefined'}</p>
        <p><strong>Is Banned:</strong> {profile?.is_banned ? 'Sim' : 'Não'}</p>
        <p><strong>Plano:</strong> {profile?.plano}</p>
      </div>

      <div className="mt-4 bg-gray-900 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Profile completo:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}
