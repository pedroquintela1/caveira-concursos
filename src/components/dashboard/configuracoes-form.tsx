'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Save, Loader2, User, Mail, Target } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ConfiguracoesFormProps {
  profile: Profile | null
  userEmail: string
}

export function ConfiguracoesForm({ profile, userEmail }: ConfiguracoesFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nome_exibicao: profile?.nome_exibicao || '',
    nome_completo: profile?.nome_completo || '',
    concurso_alvo: profile?.concurso_alvo || '',
    meta_questoes_dia: profile?.meta_questoes_dia || 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_exibicao: formData.nome_exibicao.trim() || null,
          nome_completo: formData.nome_completo.trim() || null,
          concurso_alvo: formData.concurso_alvo.trim() || null,
          meta_questoes_dia: formData.meta_questoes_dia,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil')
      }

      setSuccess(true)
      router.refresh()

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações Pessoais */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#8fbc8f]" />
          Informações Pessoais
        </h2>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            O email não pode ser alterado
          </p>
        </div>

        {/* Nome de Exibição */}
        <div>
          <label htmlFor="nome_exibicao" className="block text-sm font-medium text-gray-300 mb-2">
            Nome de Exibição (como você quer ser chamado)
          </label>
          <input
            type="text"
            id="nome_exibicao"
            maxLength={100}
            value={formData.nome_exibicao}
            onChange={(e) => setFormData({ ...formData, nome_exibicao: e.target.value })}
            placeholder="Ex: Pedro, Dr. Silva, Prof. João..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Este nome aparecerá na mensagem "Olá, [nome]!" do dashboard
          </p>
        </div>

        {/* Nome Completo */}
        <div>
          <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-300 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            id="nome_completo"
            maxLength={200}
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            placeholder="Ex: Pedro Luiz Gonçalves"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se não definir um nome de exibição, usaremos o primeiro nome daqui
          </p>
        </div>
      </div>

      {/* Metas de Estudo */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#8fbc8f]" />
          Metas de Estudo
        </h2>

        {/* Concurso Alvo */}
        <div>
          <label htmlFor="concurso_alvo" className="block text-sm font-medium text-gray-300 mb-2">
            Concurso Alvo
          </label>
          <input
            type="text"
            id="concurso_alvo"
            maxLength={200}
            value={formData.concurso_alvo}
            onChange={(e) => setFormData({ ...formData, concurso_alvo: e.target.value })}
            placeholder="Ex: PM-SP 2025, PRF 2025..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
          />
        </div>

        {/* Meta de Questões */}
        <div>
          <label htmlFor="meta_questoes" className="block text-sm font-medium text-gray-300 mb-2">
            Meta de Questões por Dia: {formData.meta_questoes_dia}
          </label>
          <input
            type="range"
            id="meta_questoes"
            min={5}
            max={100}
            step={5}
            value={formData.meta_questoes_dia}
            onChange={(e) =>
              setFormData({ ...formData, meta_questoes_dia: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8fbc8f]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>5</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-sm text-green-500">Configurações salvas com sucesso!</p>
        </div>
      )}

      {/* Botão de Salvar */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold py-6"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </>
        )}
      </Button>
    </form>
  )
}
