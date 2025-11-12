'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ComentarioCard } from '@/components/comentarios/comentario-card'
import { PaywallComentarios } from '@/components/comentarios/paywall-comentarios'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ComentariosSectionProps {
  questaoId: number
  plano: 'free' | 'basic' | 'premium'
}

interface Comentario {
  id: number
  questao_id: number
  user_id: string
  comentario: string
  tipo: 'comunidade' | 'professor'
  is_professor: boolean
  is_editado: boolean
  upvotes: number
  downvotes: number
  total_votos: number
  user_votou: 'upvote' | 'downvote' | null
  autor_nome: string
  autor_avatar: string | null
  created_at: string
  updated_at: string
}

interface ComentariosResponse {
  comentarios: Comentario[]
  meta: {
    total: number
    professores: number
    comunidade: number
  }
  permissoes: {
    pode_comentar: boolean
    pode_votar: boolean
    pode_ler: boolean
  }
}

export function ComentariosSection({
  questaoId,
  plano,
}: ComentariosSectionProps) {
  const [novoComentario, setNovoComentario] = useState('')
  const [userId, setUserId] = useState<string>('')
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  // Fetch comentários
  const {
    data,
    isLoading,
    error,
  } = useQuery<ComentariosResponse>({
    queryKey: ['comentarios', questaoId],
    queryFn: async () => {
      const response = await fetch(`/api/questoes/${questaoId}/comentarios`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar comentários')
      }
      return response.json()
    },
    enabled: plano !== 'free', // Não buscar se for FREE
  })

  // Mutation: Criar comentário
  const criarComentarioMutation = useMutation({
    mutationFn: async (comentario: string) => {
      const response = await fetch(`/api/questoes/${questaoId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.paywall) {
          throw new Error(data.message || data.error)
        }
        throw new Error(data.error || 'Erro ao criar comentário')
      }

      return data
    },
    onSuccess: () => {
      // Refetch comentários
      queryClient.invalidateQueries({ queryKey: ['comentarios', questaoId] })
      setNovoComentario('')
      toast.success('Comentário publicado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (novoComentario.trim().length < 10) {
      toast.error('Comentário deve ter no mínimo 10 caracteres')
      return
    }

    if (novoComentario.trim().length > 2000) {
      toast.error('Comentário deve ter no máximo 2000 caracteres')
      return
    }

    criarComentarioMutation.mutate(novoComentario)
  }

  const handleComentarioUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['comentarios', questaoId] })
  }

  const handleComentarioDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['comentarios', questaoId] })
  }

  // Renderizar paywall se FREE
  if (plano === 'free') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">
            Comentários da Comunidade
          </h2>
        </div>
        <PaywallComentarios planoAtual="free" tipo="leitura" />
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">
            Comentários da Comunidade
          </h2>
        </div>
        <Skeleton className="h-32 w-full bg-gray-800" />
        <Skeleton className="h-32 w-full bg-gray-800" />
        <Skeleton className="h-32 w-full bg-gray-800" />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">
            Comentários da Comunidade
          </h2>
        </div>
        <Card className="border-red-900/50 bg-red-950/20">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-400">
              Erro ao carregar comentários. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const comentarios = data?.comentarios || []
  const meta = data?.meta || { total: 0, professores: 0, comunidade: 0 }
  const permissoes = data?.permissoes || {
    pode_comentar: false,
    pode_votar: false,
    pode_ler: true,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-[#8fbc8f]" />
          <h2 className="text-lg font-semibold text-white">
            Comentários da Comunidade
          </h2>
          {meta.total > 0 && (
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-400">
              {meta.total}
            </span>
          )}
        </div>

        {meta.professores > 0 && (
          <div className="text-xs text-gray-500">
            {meta.professores} de professor{meta.professores > 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Form: Criar comentário */}
      {permissoes.pode_comentar ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Compartilhe sua opinião sobre esta questão..."
                className="min-h-[100px] resize-none bg-gray-800 text-white placeholder:text-gray-500"
                disabled={criarComentarioMutation.isPending}
              />

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs',
                    novoComentario.length < 10 && 'text-gray-500',
                    novoComentario.length >= 10 &&
                      novoComentario.length <= 2000 &&
                      'text-green-500',
                    novoComentario.length > 2000 && 'text-red-500'
                  )}
                >
                  {novoComentario.length} / 2000 caracteres
                  {novoComentario.length < 10 &&
                    ` (mínimo 10)`}
                </span>

                <Button
                  type="submit"
                  className="bg-[#8fbc8f] hover:bg-[#7da87d]"
                  disabled={
                    criarComentarioMutation.isPending ||
                    novoComentario.trim().length < 10 ||
                    novoComentario.trim().length > 2000
                  }
                >
                  {criarComentarioMutation.isPending ? (
                    <>Publicando...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <PaywallComentarios planoAtual={plano} tipo="criacao" />
      )}

      {/* Lista de comentários */}
      {comentarios.length === 0 ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-600" />
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Nenhum comentário ainda
              </h3>
              <p className="text-sm text-gray-500">
                {permissoes.pode_comentar
                  ? 'Seja o primeiro a comentar!'
                  : 'Faça upgrade para PREMIUM e participe das discussões'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comentarios.map((comentario) => (
            <ComentarioCard
              key={comentario.id}
              comentario={comentario}
              currentUserId={userId}
              plano={plano}
              onComentarioUpdated={handleComentarioUpdated}
              onComentarioDeleted={handleComentarioDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
