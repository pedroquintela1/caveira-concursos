'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Edit2, Archive, Trash2, Play } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Caderno = Database['public']['Tables']['cadernos']['Row']

interface CadernosListClientProps {
  cadernos: Caderno[]
  plano: string
}

interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmText: string
  variant: 'default' | 'destructive'
  onConfirm: () => void
}

export function CadernosListClient({ cadernos: initialCadernos, plano }: CadernosListClientProps) {
  const router = useRouter()
  const [cadernos, setCadernos] = useState(initialCadernos)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'default',
    onConfirm: () => {},
  })

  const closeDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false })
  }

  const handleDelete = async (cadernoId: number, nome: string, totalResolvidas: number) => {
    const description = totalResolvidas > 0
      ? `ATENÇÃO: Este caderno possui ${totalResolvidas} questão(ões) respondida(s).\n\nTem certeza que deseja DELETAR "${nome}"?\n\nEsta ação NÃO pode ser desfeita!`
      : `Tem certeza que deseja deletar "${nome}"?\n\nEsta ação NÃO pode ser desfeita!`

    setConfirmDialog({
      open: true,
      title: 'Excluir Caderno',
      description,
      confirmText: 'Excluir',
      variant: 'destructive',
      onConfirm: async () => {
        closeDialog()
        setLoadingId(cadernoId)

        try {
          const confirmParam = totalResolvidas > 0 ? '?confirm=true' : ''
          const url = `/api/cadernos/${cadernoId}${confirmParam}`

          const response = await fetch(url, {
            method: 'DELETE',
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao deletar caderno')
          }

          // Remover da lista local
          setCadernos(prev => prev.filter(c => c.id !== cadernoId))

          toast.success('Caderno excluído com sucesso!', {
            description: `O caderno "${nome}" foi removido permanentemente.`,
          })

          router.refresh()
        } catch (error: any) {
          console.error('Erro ao deletar:', error)
          toast.error('Erro ao excluir caderno', {
            description: error.message,
          })
        } finally {
          setLoadingId(null)
        }
      },
    })
  }

  const handleToggleAtivo = async (cadernoId: number, currentIsAtivo: boolean, nome: string) => {
    const action = currentIsAtivo ? 'arquivar' : 'reativar'
    const actionTitle = currentIsAtivo ? 'Arquivar Caderno' : 'Reativar Caderno'

    setConfirmDialog({
      open: true,
      title: actionTitle,
      description: `Deseja ${action} o caderno "${nome}"?${
        currentIsAtivo
          ? '\n\nCadernos arquivados não contam no limite do seu plano.'
          : '\n\nEste caderno voltará a ficar ativo.'
      }`,
      confirmText: currentIsAtivo ? 'Arquivar' : 'Reativar',
      variant: 'default',
      onConfirm: async () => {
        closeDialog()
        setLoadingId(cadernoId)

        try {
          const response = await fetch(`/api/cadernos/${cadernoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_ativo: !currentIsAtivo }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar caderno')
          }

          // Atualizar lista local
          setCadernos(prev =>
            prev.map(c => c.id === cadernoId ? { ...c, is_ativo: !currentIsAtivo } : c)
          )

          toast.success(`Caderno ${action === 'arquivar' ? 'arquivado' : 'reativado'}!`, {
            description: `O caderno "${nome}" foi ${action === 'arquivar' ? 'arquivado' : 'reativado'} com sucesso.`,
          })

          router.refresh()
        } catch (error: any) {
          toast.error('Erro ao atualizar caderno', {
            description: error.message,
          })
        } finally {
          setLoadingId(null)
        }
      },
    })
  }

  if (cadernos.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum caderno criado</h3>
        <p className="text-gray-400 mb-6">
          Crie seu primeiro caderno personalizado para começar a estudar!
        </p>
        <Link href="/dashboard/cadernos/novo">
          <Button className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold">
            Criar Primeiro Caderno
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cadernos.map((caderno) => {
          const percentual =
            caderno.total_questoes && caderno.total_questoes > 0
              ? ((caderno.questoes_respondidas || 0) / caderno.total_questoes) * 100
              : 0

          const isLoading = loadingId === caderno.id

          return (
            <div
              key={caderno.id}
              className="group h-full p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-[#8fbc8f] transition-all relative"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#8fbc8f] transition-colors truncate">
                    {caderno.nome}
                  </h3>
                  {caderno.descricao && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {caderno.descricao}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                {caderno.is_concluido ? (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-900/30 text-green-500 border border-green-800 rounded whitespace-nowrap">
                    Concluído
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-500 border border-blue-800 rounded whitespace-nowrap">
                    Ativo
                  </span>
                )}
              </div>

              {/* Progresso */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progresso</span>
                  <span className="text-white font-medium">
                    {caderno.questoes_respondidas || 0} / {caderno.total_questoes || 0} questões
                  </span>
                </div>

                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8fbc8f] transition-all"
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>

                {/* Taxa de Acerto */}
                {(caderno.questoes_respondidas || 0) > 0 && caderno.taxa_acerto !== null && (
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-gray-500">Taxa de acerto</span>
                    <span
                      className={`font-medium ${
                        caderno.taxa_acerto >= 70
                          ? 'text-green-500'
                          : caderno.taxa_acerto >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {caderno.taxa_acerto.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t border-gray-800">
                <Link href={`/dashboard/cadernos/${caderno.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#8fbc8f] text-[#8fbc8f] hover:bg-[#8fbc8f] hover:text-black"
                    disabled={isLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resolver
                  </Button>
                </Link>

                <Link href={`/dashboard/cadernos/${caderno.id}/editar`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-gray-800"
                    disabled={isLoading}
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-gray-800"
                  onClick={() => handleToggleAtivo(caderno.id, caderno.is_ativo, caderno.nome)}
                  disabled={isLoading || !!caderno.is_concluido}
                  title={caderno.is_ativo ? 'Arquivar' : 'Reativar'}
                >
                  <Archive className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-800"
                  onClick={() => handleDelete(caderno.id, caderno.nome, caderno.questoes_respondidas || 0)}
                  disabled={isLoading}
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8fbc8f]"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={closeDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        loading={loadingId !== null}
      />
    </>
  )
}
