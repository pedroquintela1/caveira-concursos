import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ManageSubscriptionButton } from '@/components/stripe/manage-subscription-button'
import { PricingCard } from '@/components/stripe/pricing-card'
import { STRIPE_PLANS } from '@/lib/stripe/config'
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Crown,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const metadata = {
  title: 'Minha Assinatura | KAV Concursos',
  description: 'Gerencie sua assinatura e veja detalhes do seu plano',
}

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const supabase = createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Buscar informações do perfil e assinatura
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'plano, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_current_period_end'
    )
    .eq('id', user.id)
    .single()

  const plano = profile?.plano || 'free'
  const hasActiveSubscription = profile?.stripe_subscription_id && profile?.stripe_subscription_status === 'active'

  // Mensagens de sucesso/erro
  const showSuccess = searchParams.success === 'true'
  const showCanceled = searchParams.canceled === 'true'

  const PLANO_INFO = {
    free: {
      nome: 'FREE',
      cor: 'gray',
      icon: AlertCircle,
    },
    basic: {
      nome: 'BASIC',
      cor: 'blue',
      icon: Sparkles,
    },
    premium: {
      nome: 'PREMIUM',
      cor: 'purple',
      icon: Crown,
    },
  }

  const planoInfo = PLANO_INFO[plano as keyof typeof PLANO_INFO]
  const Icon = planoInfo.icon

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Minha Assinatura</h1>
          <p className="text-gray-400 mt-2">
            Gerencie sua assinatura e veja detalhes do seu plano
          </p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-500">
                Assinatura ativada com sucesso!
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Sua assinatura foi processada e já está ativa. Aproveite todos os benefícios do seu plano!
              </p>
            </div>
          </div>
        )}

        {showCanceled && (
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-800 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-500">
                Checkout cancelado
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                O processo de checkout foi cancelado. Você pode tentar novamente quando quiser.
              </p>
            </div>
          </div>
        )}

        {/* Plano Atual Card */}
        <Card className="mb-8 border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    plano === 'premium'
                      ? 'from-purple-600 to-pink-600'
                      : plano === 'basic'
                      ? 'from-blue-600 to-cyan-600'
                      : 'from-gray-600 to-gray-700'
                  } flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Plano {planoInfo.nome}</CardTitle>
                  <CardDescription>
                    {plano === 'free'
                      ? 'Plano gratuito'
                      : `R$ ${STRIPE_PLANS[plano as 'basic' | 'premium'].price.toFixed(2)}/mês`}
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant={hasActiveSubscription ? 'default' : 'outline'}
                className={
                  hasActiveSubscription
                    ? 'bg-green-900/30 text-green-500 border-green-800'
                    : 'border-gray-700 text-gray-400'
                }
              >
                {hasActiveSubscription ? 'Ativa' : plano === 'free' ? 'Gratuito' : 'Inativa'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Detalhes da Assinatura */}
            {hasActiveSubscription && profile?.stripe_current_period_end && (
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">Próxima renovação</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(profile.stripe_current_period_end), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            )}

            {profile?.stripe_customer_id && (
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Forma de pagamento</p>
                  <p className="text-sm text-gray-400">Gerenciada via Stripe</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
              {hasActiveSubscription ? (
                <ManageSubscriptionButton className="border-gray-700 text-gray-300 hover:bg-gray-800" />
              ) : (
                <Link href="/dashboard/planos">
                  <Button className="bg-[#8fbc8f] hover:bg-[#7dad7d] text-black font-semibold">
                    Ver Planos Disponíveis
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Section (apenas se não for Premium) */}
        {plano !== 'premium' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              {plano === 'free' ? 'Escolha um Plano' : 'Faça Upgrade'}
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {plano === 'free' && (
                <PricingCard
                  plan="basic"
                  name="BASIC"
                  price={STRIPE_PLANS.basic.price}
                  priceId={STRIPE_PLANS.basic.priceId}
                  features={STRIPE_PLANS.basic.features}
                  recommended={true}
                  userPlan={plano}
                />
              )}

              <PricingCard
                plan="premium"
                name="PREMIUM"
                price={STRIPE_PLANS.premium.price}
                priceId={STRIPE_PLANS.premium.priceId}
                features={STRIPE_PLANS.premium.features}
                userPlan={plano}
              />
            </div>
          </>
        )}

        {/* Plano Premium - Obrigado */}
        {plano === 'premium' && hasActiveSubscription && (
          <Card className="border-purple-800/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-500" />
                Obrigado por ser Premium!
              </CardTitle>
              <CardDescription>
                Você tem acesso a todos os recursos e ferramentas da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Continue aproveitando cadernos ilimitados, materiais extras, IA e muito mais para acelerar seus
                estudos e conquistar sua aprovação!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
