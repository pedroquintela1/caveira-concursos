import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function VerifyAdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Verificar permissões admin
  const adminRoles = ['super_admin', 'admin', 'moderador'];
  const isAdmin = adminRoles.includes(profile?.role || '');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Verificação de Admin</h1>

        {/* Status de Autenticação */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Autenticação</h2>
          <div className="space-y-2">
            <p>✅ <strong>Autenticado:</strong> Sim</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>

        {/* Status do Profile */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          {profileError ? (
            <div className="bg-red-900/20 border border-red-500 rounded p-4">
              <p className="text-red-400">❌ Erro ao buscar profile:</p>
              <pre className="text-xs mt-2">{JSON.stringify(profileError, null, 2)}</pre>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Nome:</strong> {profile?.nome_completo || 'Não definido'}</p>
              <p><strong>Role:</strong> <span className={profile?.role ? 'text-green-400' : 'text-red-400'}>{profile?.role || 'undefined'}</span></p>
              <p><strong>Is Banned:</strong> <span className={profile?.is_banned ? 'text-red-400' : 'text-green-400'}>{profile?.is_banned ? 'Sim' : 'Não'}</span></p>
              <p><strong>Plano:</strong> {profile?.plano}</p>
              <p><strong>Is Active:</strong> {profile?.is_active ? 'Sim' : 'Não'}</p>
            </div>
          )}
        </div>

        {/* Verificação de Permissões Admin */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Permissões Admin</h2>
          <div className="space-y-3">
            <p><strong>Roles permitidos:</strong> {adminRoles.join(', ')}</p>
            <p><strong>Seu role:</strong> {profile?.role || 'undefined'}</p>
            <div className={`p-4 rounded-lg border ${isAdmin ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
              {isAdmin ? (
                <>
                  <p className="text-green-400 font-bold text-lg">✅ Você TEM permissão admin!</p>
                  <p className="text-sm mt-2">Você deve conseguir acessar: <a href="/admin" className="text-blue-400 underline">/admin</a></p>
                </>
              ) : (
                <>
                  <p className="text-red-400 font-bold text-lg">❌ Você NÃO tem permissão admin</p>
                  <p className="text-sm mt-2">Role necessário: super_admin, admin ou moderador</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Teste de Acesso */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Testes de Acesso</h2>
          <div className="space-y-3">
            <a href="/admin" className="block px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-center font-medium transition-colors">
              🚀 Tentar acessar /admin
            </a>
            <a href="/dashboard" className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium transition-colors">
              🏠 Voltar ao Dashboard
            </a>
          </div>
        </div>

        {/* Debug: Profile Completo */}
        <details className="bg-gray-900 rounded-lg border border-gray-800">
          <summary className="p-4 cursor-pointer font-semibold">🔍 Ver Profile Completo (Debug)</summary>
          <pre className="p-4 text-xs overflow-auto bg-black rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
