import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckoutButton } from './checkout-button'
import { Check, Sparkles, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PricingCardProps {
  plan: 'basic' | 'premium'
  name: string
  price: number
  priceId: string
  features: string[]
  recommended?: boolean
  userPlan: 'free' | 'basic' | 'premium'
}

export function PricingCard({
  plan,
  name,
  price,
  priceId,
  features,
  recommended = false,
  userPlan,
}: PricingCardProps) {
  const Icon = plan === 'premium' ? Crown : Sparkles
  const isCurrentPlan = userPlan === plan
  const isDowngrade = (userPlan === 'premium' && plan === 'basic') || userPlan === plan

  const gradientClass =
    plan === 'premium'
      ? 'from-purple-600 to-pink-600'
      : 'from-blue-600 to-cyan-600'

  const iconColor = plan === 'premium' ? 'text-purple-500' : 'text-blue-500'

  return (
    <Card
      className={`relative border-gray-800 bg-gray-900/50 backdrop-blur ${
        recommended ? 'border-2 border-[#8fbc8f] shadow-lg shadow-[#8fbc8f]/20' : ''
      }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-[#8fbc8f] text-black font-semibold px-4 py-1">
            Recomendado
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        <CardTitle className="text-2xl text-white font-bold">{name}</CardTitle>

        <div className="mt-4">
          <span className="text-4xl font-bold text-white">R$ {price.toFixed(2)}</span>
          <span className="text-gray-400">/mês</span>
        </div>

        {isCurrentPlan && (
          <Badge variant="outline" className="mt-3 border-[#8fbc8f] text-[#8fbc8f]">
            Plano Atual
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <Check className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <div className="pt-4">
            <div className="w-full py-3 text-center text-sm text-gray-400 bg-gray-800 rounded-lg">
              Você já está neste plano
            </div>
          </div>
        ) : isDowngrade ? (
          <div className="pt-4">
            <div className="w-full py-3 text-center text-sm text-gray-400 bg-gray-800 rounded-lg">
              Downgrade disponível no portal
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <CheckoutButton
              priceId={priceId}
              planName={name}
              className={`w-full font-semibold ${
                plan === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              } text-white`}
            >
              Assinar {name}
            </CheckoutButton>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
