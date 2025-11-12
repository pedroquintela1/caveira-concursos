'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeletePastaButtonProps {
  pastaId: number
  pastaNome: string
  totalCadernos: number
}

export function DeletePastaButton({ pastaId, pastaNome, totalCadernos }: DeletePastaButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    // Verificar se tem cadernos
    if (totalCadernos > 0) {
      toast.error('Não é possível excluir a pasta', {
        description: `A pasta "${pastaNome}" contém ${totalCadernos} caderno(s). Primeiro mova ou exclua todos os cadernos desta pasta.`,
      })
      return
    }

    // Abrir confirmação
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    setShowConfirm(false)
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/pastas/${pastaId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir pasta')
      }

      toast.success('Pasta excluída com sucesso!', {
        description: `A pasta "${pastaNome}" foi removida permanentemente.`,
      })

      router.push('/dashboard/cadernos')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir pasta:', error)
      toast.error('Erro ao excluir pasta', {
        description: error.message,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-800"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? 'Excluindo...' : 'Excluir Pasta'}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={confirmDelete}
        title="Excluir Pasta"
        description={`Tem certeza que deseja excluir a pasta "${pastaNome}"?\n\nEsta ação NÃO pode ser desfeita!`}
        confirmText="Excluir"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  )
}
