'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Caderno = Database['public']['Tables']['cadernos']['Row']

interface EditarCadernoFormProps {
  caderno: Caderno
  disciplinas: Array<{ id: number; nome: string; slug: string }>
  bancas: Array<{ id: number; nome: string; sigla: string }>
  orgaos: Array<{ id: number; nome: string; sigla: string }>
  plano: string
}

export function EditarCadernoForm({
  caderno,
  disciplinas,
  bancas,
  orgaos,
  plano,
}: EditarCadernoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extrair filtros do objeto JSON
  const filtros = caderno.filtros as any || {}

  // Form state com dados do caderno
  const [formData, setFormData] = useState({
    nome: caderno.nome,
    descricao: caderno.descricao || '',
    disciplina_id: filtros.disciplina_id?.toString() || '',
    banca_id: filtros.banca_id?.toString() || '',
    orgao_id: filtros.orgao_id?.toString() || '',
    ano_inicio: filtros.ano_inicio?.toString() || '',
    ano_fim: filtros.ano_fim?.toString() || '',
    dificuldade: filtros.dificuldade || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        disciplina_id: formData.disciplina_id ? parseInt(formData.disciplina_id) : null,
        banca_id: formData.banca_id ? parseInt(formData.banca_id) : null,
        orgao_id: formData.orgao_id ? parseInt(formData.orgao_id) : null,
        ano_inicio: formData.ano_inicio ? parseInt(formData.ano_inicio) : null,
        ano_fim: formData.ano_fim ? parseInt(formData.ano_fim) : null,
        dificuldade: formData.dificuldade || null,
      }

      const response = await fetch(`/api/cadernos/${caderno.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar caderno')
      }

      // Sucesso - redirecionar de volta
      router.push('/dashboard/cadernos')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/cadernos"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Meus Cadernos
        </Link>
        <h1 className="text-3xl font-bold text-white">Editar Caderno</h1>
        <p className="text-gray-400 mt-2">
          Atualize as informações do caderno "{caderno.nome}"
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-6">
          <h2 className="text-xl font-semibold text-white">Informações Básicas</h2>

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Caderno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nome"
              required
              minLength={3}
              maxLength={200}
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: PM-SP 2024 - Direito Penal"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 3 caracteres • {formData.nome.length}/200
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="descricao"
              rows={3}
              maxLength={500}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o objetivo deste caderno..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f] resize-none"
            />
          </div>
        </div>

        {/* Filtros de Questões */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Filtros de Questões</h2>
            <p className="text-sm text-gray-400 mt-1">
              ATENÇÃO: Alterar os filtros NÃO afeta as questões já respondidas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disciplina */}
            <div>
              <label
                htmlFor="disciplina"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Disciplina
              </label>
              <select
                id="disciplina"
                value={formData.disciplina_id}
                onChange={(e) => setFormData({ ...formData, disciplina_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8fbc8f]"
              >
                <option value="">Todas as disciplinas</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Banca */}
            <div>
              <label htmlFor="banca" className="block text-sm font-medium text-gray-300 mb-2">
                Banca
              </label>
              <select
                id="banca"
                value={formData.banca_id}
                onChange={(e) => setFormData({ ...formData, banca_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8fbc8f]"
              >
                <option value="">Todas as bancas</option>
                {bancas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.sigla} - {b.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Órgão */}
            <div>
              <label htmlFor="orgao" className="block text-sm font-medium text-gray-300 mb-2">
                Órgão
              </label>
              <select
                id="orgao"
                value={formData.orgao_id}
                onChange={(e) => setFormData({ ...formData, orgao_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8fbc8f]"
              >
                <option value="">Todos os órgãos</option>
                {orgaos.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.sigla} - {o.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Dificuldade */}
            <div>
              <label
                htmlFor="dificuldade"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Dificuldade
              </label>
              <select
                id="dificuldade"
                value={formData.dificuldade}
                onChange={(e) => setFormData({ ...formData, dificuldade: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8fbc8f]"
              >
                <option value="">Todas as dificuldades</option>
                <option value="facil">Fácil</option>
                <option value="media">Média</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>

            {/* Ano Início */}
            <div>
              <label
                htmlFor="ano_inicio"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Ano Início
              </label>
              <input
                type="number"
                id="ano_inicio"
                min={2000}
                max={2100}
                value={formData.ano_inicio}
                onChange={(e) => setFormData({ ...formData, ano_inicio: e.target.value })}
                placeholder="Ex: 2020"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
              />
            </div>

            {/* Ano Fim */}
            <div>
              <label htmlFor="ano_fim" className="block text-sm font-medium text-gray-300 mb-2">
                Ano Fim
              </label>
              <input
                type="number"
                id="ano_fim"
                min={2000}
                max={2100}
                value={formData.ano_fim}
                onChange={(e) => setFormData({ ...formData, ano_fim: e.target.value })}
                placeholder="Ex: 2024"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8fbc8f]"
              />
            </div>
          </div>
        </div>

        {/* Info do Progresso */}
        <div className="p-6 bg-blue-900/10 border border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ Informação</h3>
          <p className="text-sm text-gray-400">
            Este caderno possui <strong className="text-white">{caderno.questoes_respondidas || 0}</strong> questão(ões) respondida(s).
            Total de questões no caderno: <strong className="text-white">{caderno.total_questoes || 0}</strong>.
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.nome || formData.nome.trim().length < 3}
            className="flex-1 bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
