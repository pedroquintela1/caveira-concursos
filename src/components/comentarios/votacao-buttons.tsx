'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VotacaoButtonsProps {
  comentarioId: number
  upvotes: number
  downvotes: number
  userVotou: 'upvote' | 'downvote' | null
  onVotoChange?: (novoVoto: 'upvote' | 'downvote' | null) => void
  disabled?: boolean
}

export function VotacaoButtons({
  comentarioId,
  upvotes,
  downvotes,
  userVotou,
  onVotoChange,
  disabled = false,
}: VotacaoButtonsProps) {
  const [votoAtual, setVotoAtual] = useState<'upvote' | 'downvote' | null>(
    userVotou
  )
  const [votosPositivos, setVotosPositivos] = useState(upvotes)
  const [votosNegativos, setVotosNegativos] = useState(downvotes)
  const [isVotando, setIsVotando] = useState(false)

  const totalVotos = votosPositivos - votosNegativos

  const handleVotar = async (tipo: 'upvote' | 'downvote') => {
    if (disabled) {
      toast.error('Votação disponível apenas para plano PREMIUM', {
        description: 'Faça upgrade para participar das discussões',
      })
      return
    }

    setIsVotando(true)

    try {
      const response = await fetch(`/api/comentarios/${comentarioId}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.paywall) {
          toast.error(data.error, {
            description: data.hint,
          })
          return
        }
        throw new Error(data.error || 'Erro ao votar')
      }

      // Atualizar estado local
      setVotoAtual(data.voto)
      setVotosPositivos(data.comentario.upvotes)
      setVotosNegativos(data.comentario.downvotes)

      // Notificar componente pai
      if (onVotoChange) {
        onVotoChange(data.voto)
      }

      toast.success(data.message)
    } catch (error) {
      console.error('Erro ao votar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao votar')
    } finally {
      setIsVotando(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Upvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVotar('upvote')}
        disabled={isVotando || disabled}
        className={cn(
          'h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-500',
          votoAtual === 'upvote' &&
            'bg-green-500/20 text-green-600 hover:bg-green-500/30'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      {/* Contador */}
      <span
        className={cn(
          'text-sm font-semibold tabular-nums',
          totalVotos > 0 && 'text-green-600',
          totalVotos < 0 && 'text-red-600',
          totalVotos === 0 && 'text-gray-500'
        )}
      >
        {totalVotos > 0 ? '+' : ''}
        {totalVotos}
      </span>

      {/* Downvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVotar('downvote')}
        disabled={isVotando || disabled}
        className={cn(
          'h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500',
          votoAtual === 'downvote' &&
            'bg-red-500/20 text-red-600 hover:bg-red-500/30'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
