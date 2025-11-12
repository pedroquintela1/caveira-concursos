'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { VotacaoButtons } from './votacao-buttons'
import { Edit2, Trash2, Check, X, GraduationCap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ComentarioCardProps {
  comentario: {
    id: number
    user_id: string
    comentario: string
    tipo: 'comunidade' | 'professor'
    is_professor: boolean
    is_editado: boolean
    upvotes: number
    downvotes: number
    user_votou: 'upvote' | 'downvote' | null
    autor_nome: string
    autor_avatar: string | null
    created_at: string
    updated_at: string
  }
  currentUserId: string
  plano: 'free' | 'basic' | 'premium'
  onComentarioUpdated?: () => void
  onComentarioDeleted?: () => void
}

export function ComentarioCard({
  comentario,
  currentUserId,
  plano,
  onComentarioUpdated,
  onComentarioDeleted,
}: ComentarioCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(comentario.comentario)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isAutor = comentario.user_id === currentUserId
  const isPremium = plano === 'premium'

  // Verificar se pode editar/deletar (autor + <24h)
  const createdAt = new Date(comentario.created_at)
  const now = new Date()
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  const podeEditar = isAutor && hoursElapsed < 24

  const handleEdit = async () => {
    if (editedText.trim().length < 10) {
      toast.error('Comentário deve ter no mínimo 10 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comentarios/${comentario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario: editedText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao editar comentário')
      }

      toast.success('Comentário atualizado com sucesso')
      setIsEditing(false)
      if (onComentarioUpdated) onComentarioUpdated()
    } catch (error) {
      console.error('Erro ao editar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao editar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comentarios/${comentario.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar comentário')
      }

      toast.success('Comentário deletado com sucesso')
      if (onComentarioDeleted) onComentarioDeleted()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const timeAgo = formatDistanceToNow(new Date(comentario.created_at), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <Card
      className={cn(
        'border-gray-800 bg-gray-900/50',
        comentario.is_professor && 'border-l-4 border-l-yellow-500'
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Votação */}
          <div className="flex-shrink-0">
            <VotacaoButtons
              comentarioId={comentario.id}
              upvotes={comentario.upvotes}
              downvotes={comentario.downvotes}
              userVotou={comentario.user_votou}
              disabled={!isPremium}
            />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comentario.autor_avatar || undefined} />
                  <AvatarFallback className="bg-gray-700 text-xs">
                    {getInitials(comentario.autor_nome)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {comentario.autor_nome}
                    </span>

                    {comentario.is_professor && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
                      >
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Professor
                      </Badge>
                    )}

                    {comentario.is_editado && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        editado
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-gray-500">{timeAgo}</span>
                </div>
              </div>

              {/* Ações (editar/deletar) */}
              {podeEditar && !isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteClick}
                    disabled={isSubmitting}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Comentário */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[80px] resize-none bg-gray-800 text-white"
                  placeholder="Escreva seu comentário..."
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isSubmitting || editedText.trim().length < 10}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedText(comentario.comentario)
                    }}
                    disabled={isSubmitting}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {comentario.comentario}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Excluir comentário"
        description="Tem certeza que deseja excluir este comentário?\n\nEsta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
        loading={isSubmitting}
      />
    </Card>
  )
}
