'use client';

import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/stripe/pricing-card';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import Link from 'next/link';

interface PlanosClientProps {
  planoAtual: 'free' | 'basic' | 'premium';
}

export function PlanosClient({ planoAtual }: PlanosClientProps) {
  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="font-saira text-4xl font-bold text-white">
          Escolha seu Plano
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          Invista no seu futuro e conquiste a aprovação
        </p>
        {planoAtual && (
          <Badge className="mt-4 bg-[#8fbc8f]/20 text-[#8fbc8f]">
            Plano atual: {planoAtual.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FREE Plan */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">FREE</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">R$ 0</span>
              <span className="text-gray-400">/mês</span>
            </div>
            {planoAtual === 'free' && (
              <Badge variant="outline" className="mt-3 border-[#8fbc8f] text-[#8fbc8f]">
                Plano Atual
              </Badge>
            )}
          </div>
          <ul className="space-y-3 mb-6 text-sm text-gray-300">
            <li>✓ 2 cadernos simultâneos</li>
            <li>✓ 50 questões por caderno</li>
            <li>✓ 5 questões por dia</li>
            <li>✗ Sem comentários</li>
            <li>✗ Sem materiais extras</li>
          </ul>
          <Button disabled className="w-full bg-gray-700">
            Plano Gratuito
          </Button>
        </Card>

        {/* BASIC Plan */}
        <PricingCard
          plan="basic"
          name="BASIC"
          price={STRIPE_PLANS.basic.price}
          priceId={STRIPE_PLANS.basic.priceId}
          features={STRIPE_PLANS.basic.features}
          recommended={true}
          userPlan={planoAtual}
        />

        {/* PREMIUM Plan */}
        <PricingCard
          plan="premium"
          name="PREMIUM"
          price={STRIPE_PLANS.premium.price}
          priceId={STRIPE_PLANS.premium.priceId}
          features={STRIPE_PLANS.premium.features}
          userPlan={planoAtual}
        />
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="mb-8 text-center font-saira text-3xl font-bold text-white">
          Perguntas Frequentes
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-2 font-semibold text-white">
              Posso cancelar a qualquer momento?
            </h3>
            <p className="text-sm text-gray-400">
              Sim! Não há período de fidelidade. Você pode cancelar sua
              assinatura a qualquer momento.
            </p>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-2 font-semibold text-white">
              Quais formas de pagamento são aceitas?
            </h3>
            <p className="text-sm text-gray-400">
              Aceitamos cartão de crédito, PIX e boleto bancário através da
              plataforma Stripe.
            </p>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-2 font-semibold text-white">
              Posso fazer upgrade depois?
            </h3>
            <p className="text-sm text-gray-400">
              Claro! Você pode fazer upgrade ou downgrade do seu plano a
              qualquer momento.
            </p>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-2 font-semibold text-white">
              Meus dados ficam salvos ao mudar de plano?
            </h3>
            <p className="text-sm text-gray-400">
              Sim! Todos os seus cadernos, mnemônicos e flashcards são mantidos
              independente do plano.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Final */}
      <div className="mt-16 rounded-lg border border-[#8fbc8f]/30 bg-gradient-to-r from-[#8fbc8f]/20 to-[#8fbc8f]/10 p-8 text-center">
        <h2 className="font-saira text-3xl font-bold text-white">
          Pronto para acelerar seus estudos?
        </h2>
        <p className="mt-3 text-gray-300">
          Junte-se a milhares de aprovados que estudam com KAV Concursos
        </p>
        <Link href="#planos">
          <Button className="mt-6 bg-[#8fbc8f] px-8 py-6 text-lg hover:bg-[#7da87d]">
            Começar Agora
          </Button>
        </Link>
      </div>
    </>
  );
}
