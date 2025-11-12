'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Circle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface ItemGabarito {
  numero: number
  questao_id: number
  codigo: string | null
  gabarito_oficial: string
  resposta_usuario: string | null
  status: 'acertou' | 'errou' | 'nao_resolvida'
  resolvida_em: string | null
}

interface CadernoGabaritoProps {
  cadernoId: number
}

export function CadernoGabarito({ cadernoId }: CadernoGabaritoProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gabarito, setGabarito] = useState<ItemGabarito[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGabarito()
  }, [cadernoId])

  const fetchGabarito = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cadernos/${cadernoId}/gabarito`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar gabarito')
      }

      setGabarito(data.gabarito || [])
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por termo de busca
  const gabaritoFiltrado = gabarito.filter((item) => {
    if (!searchTerm) return true
    const termo = searchTerm.toLowerCase()
    return (
      item.numero.toString().includes(termo) ||
      item.codigo?.toLowerCase().includes(termo) ||
      item.questao_id.toString().includes(termo)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8fbc8f]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={fetchGabarito}
          className="mt-4 bg-[#8fbc8f] hover:bg-[#7aa87a] text-gray-900"
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header com Estatísticas */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Gabarito Completo</h2>

        {/* Cards de Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Resolvidas</p>
            <p className="text-2xl font-bold text-blue-500">{stats?.resolvidas || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Acertos</p>
            <p className="text-2xl font-bold text-green-500">{stats?.acertos || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Erros</p>
            <p className="text-2xl font-bold text-red-500">{stats?.erros || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Taxa de Acerto</p>
            <p className="text-2xl font-bold text-[#8fbc8f]">{stats?.taxa_acerto || 0}%</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar por número, código ou ID da questão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white"
          />
        </div>
      </div>

      {/* Tabela de Gabarito */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Nº</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Código</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Gabarito</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Sua Resposta</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Resolvida em</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {gabaritoFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma questão no caderno'}
                  </td>
                </tr>
              ) : (
                gabaritoFiltrado.map((item) => (
                  <tr
                    key={item.numero}
                    className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                  >
                    {/* Número */}
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {item.numero}
                    </td>

                    {/* Código */}
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {item.codigo ? (
                        <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                          #{item.codigo}
                        </code>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>

                    {/* Gabarito Oficial */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                          item.status === 'acertou'
                            ? 'bg-green-500/20 text-green-500'
                            : item.status === 'errou'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {item.gabarito_oficial}
                      </span>
                    </td>

                    {/* Resposta do Usuário */}
                    <td className="px-4 py-3 text-center">
                      {item.resposta_usuario ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                            item.status === 'acertou'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {item.resposta_usuario}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {item.status === 'acertou' && (
                        <div className="inline-flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Acertou</span>
                        </div>
                      )}
                      {item.status === 'errou' && (
                        <div className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Errou</span>
                        </div>
                      )}
                      {item.status === 'nao_resolvida' && (
                        <div className="inline-flex items-center gap-1 text-gray-500">
                          <Circle className="w-4 h-4" />
                          <span className="text-xs font-medium">Não resolvida</span>
                        </div>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {item.resolvida_em ? (
                        new Date(item.resolvida_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 text-center">
                      <Link href={`/dashboard/cadernos/${cadernoId}?questao=${item.numero}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8fbc8f] hover:bg-[#8fbc8f]/20 hover:text-[#a0cca0] font-medium transition-all"
                        >
                          Ir para questão
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé com Resumo */}
      {gabaritoFiltrado.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 text-center">
          Mostrando {gabaritoFiltrado.length} de {gabarito.length} questões
        </div>
      )}
    </div>
  )
}
