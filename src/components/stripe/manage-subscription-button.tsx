'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface ManageSubscriptionButtonProps {
  className?: string
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleManageSubscription = async () => {
    try {
      setLoading(true)

      // Criar sessão do Customer Portal
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão do portal')
      }

      // Redirecionar para o Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Erro ao abrir portal:', error)
      toast.error('Erro ao abrir portal', {
        description: 'Não foi possível abrir o portal de gerenciamento. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={loading}
      variant="outline"
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </>
      ) : (
        <>
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Assinatura
        </>
      )}
    </Button>
  )
}
