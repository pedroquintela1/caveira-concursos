'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface PastaCardProps {
  pasta: {
    id: number
    nome: string
    descricao: string | null
    cor: string
    icone: string
    cadernos?: { count: number }[] | any
  }
  totalCadernos?: number
}

export function PastaCard({ pasta, totalCadernos }: PastaCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showForceConfirm, setShowForceConfirm] = useState(false)
  const [forceConfirmMessage, setForceConfirmMessage] = useState('')

  // Contar cadernos (pode vir como array ou número)
  const numCadernos = totalCadernos ?? (Array.isArray(pasta.cadernos) ? pasta.cadernos.length : 0)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      // Primeira tentativa sem force
      const response = await fetch(`/api/pastas/${pasta.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        // Se tem itens dentro, pedir confirmação com force=true
        if (response.status === 400 && data.details) {
          const confirmMessage = `Esta pasta contém ${data.details.cadernos || 0} caderno(s) e ${data.details.subpastas || 0} subpasta(s).\n\nOs cadernos serão desassociados da pasta (não serão excluídos).\nAs subpastas serão excluídas permanentemente.\n\nDeseja continuar?`

          setShowForceConfirm(true)
          setForceConfirmMessage(confirmMessage)
          setIsDeleting(false)
          return
        }

        throw new Error(data.error || 'Erro ao excluir pasta')
      }

      // Sucesso
      toast.success('Pasta excluída', {
        description: 'A pasta foi excluída com sucesso',
      })
      setShowDeleteDialog(false)
      router.refresh()
    } catch (err: any) {
      toast.error('Erro ao excluir pasta', {
        description: err.message,
      })
      setDeleteError(err.message)
      setIsDeleting(false)
    }
  }

  const handleForceDelete = async () => {
    setIsDeleting(true)
    setShowForceConfirm(false)

    try {
      // Segunda tentativa com force=true
      const forceResponse = await fetch(`/api/pastas/${pasta.id}?force=true`, {
        method: 'DELETE',
      })

      const forceData = await forceResponse.json()

      if (!forceResponse.ok) {
        throw new Error(forceData.error || 'Erro ao excluir pasta')
      }

      // Sucesso
      toast.success('Pasta excluída', {
        description: 'A pasta foi excluída com sucesso',
      })
      setShowDeleteDialog(false)
      router.refresh()
    } catch (err: any) {
      toast.error('Erro ao excluir pasta', {
        description: err.message,
      })
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Link
        href={`/dashboard/cadernos/pastas/${pasta.id}`}
        className="group relative block"
      >
        <div
          className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-gray-700 hover:bg-gray-900 hover:shadow-lg"
          style={{
            borderLeftColor: pasta.cor,
            borderLeftWidth: '4px',
          }}
        >
          {/* Ícone e Ações */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: pasta.cor + '20' }}
            >
              <Folder
                className="h-6 w-6"
                style={{ color: pasta.cor }}
              />
            </div>

            {/* Menu de Ações */}
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.preventDefault()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(`/dashboard/cadernos/pastas/${pasta.id}/editar`)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Nome e Descrição */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
              {pasta.nome}
            </h3>
            {pasta.descricao && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {pasta.descricao}
              </p>
            )}
          </div>

          {/* Contador de Cadernos */}
          <div className="flex items-center text-sm text-gray-400">
            <span className="font-medium text-white">{numCadernos}</span>
            <span className="ml-1">
              {numCadernos === 1 ? 'caderno' : 'cadernos'}
            </span>
          </div>

          {/* Hover Effect Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
            style={{ backgroundColor: pasta.cor }}
          />
        </div>
      </Link>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{pasta.nome}"?
              {numCadernos > 0 && (
                <span className="block mt-2 text-yellow-500">
                  Os {numCadernos} caderno(s) dentro desta pasta não serão excluídos,
                  apenas desassociados.
                </span>
              )}
              {deleteError && (
                <span className="block mt-2 text-red-500 text-sm">
                  Erro: {deleteError}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação Forçada */}
      <ConfirmDialog
        open={showForceConfirm}
        onOpenChange={setShowForceConfirm}
        onConfirm={handleForceDelete}
        title="Confirmar exclusão forçada"
        description={forceConfirmMessage}
        confirmText="Excluir"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  )
}
