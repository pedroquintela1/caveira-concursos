import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Buscar usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar profile com role
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role, nome_completo, is_banned')
    .eq('id', user.id)
    .single();

  // Verificar se está banido
  if (profile?.is_banned) {
    redirect('/dashboard');
  }

  // Verificar role admin
  const adminRoles = ['admin', 'super_admin', 'editor', 'moderador', 'analista'];
  if (!profile || !adminRoles.includes(profile.role || '')) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          user={{
            email: profile.email,
            role: profile.role || 'user',
            nome_completo: profile.nome_completo,
          }}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
