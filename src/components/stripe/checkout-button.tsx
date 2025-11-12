'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe/client'
import { toast } from 'sonner'

interface CheckoutButtonProps {
  priceId: string
  planName: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function CheckoutButton({
  priceId,
  planName,
  disabled = false,
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // Criar sessão de checkout no backend
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      // Redirecionar para o Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Erro ao carregar Stripe')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        console.error('Erro no checkout:', error)
        throw error
      }
    } catch (error) {
      console.error('Erro ao processar checkout:', error)
      toast.error('Erro ao iniciar checkout', {
        description: 'Não foi possível iniciar o processo de pagamento. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        children || `Assinar ${planName}`
      )}
    </Button>
  )
}
