import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesForm } from '@/components/dashboard/configuracoes-form'

export const metadata = {
  title: 'Configurações | KAV Concursos',
  description: 'Personalize sua experiência',
}

export default async function ConfiguracoesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400 mt-2">
            Personalize sua experiência no KAV Concursos
          </p>
        </div>

        {/* Form */}
        <ConfiguracoesForm profile={profile} userEmail={user.email || ''} />
      </div>
    </div>
  )
}
