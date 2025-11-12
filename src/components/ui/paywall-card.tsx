import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'

interface PaywallCardProps {
  planoAtual: 'free' | 'basic' | 'premium'
  recursoNecessario: 'basic' | 'premium'
  titulo?: string
  descricao?: string
  recurso?: string
}

const PLANO_INFO = {
  basic: {
    nome: 'BASIC',
    preco: 'R$ 39,90/mês',
    cor: 'blue',
    icon: Sparkles,
    beneficios: [
      '10 cadernos simultâneos',
      'Questões ilimitadas por dia',
      'Sistema de comentários',
      'Suporte prioritário',
    ],
  },
  premium: {
    nome: 'PREMIUM',
    preco: 'R$ 79,90/mês',
    cor: 'purple',
    icon: Crown,
    beneficios: [
      'Cadernos ilimitados',
      '500 questões por caderno',
      'Materiais extras (vídeos, PDFs)',
      'Cadernos inteligentes com IA',
      'Estatísticas avançadas',
      'Suporte VIP',
    ],
  },
}

export function PaywallCard({
  planoAtual,
  recursoNecessario,
  titulo,
  descricao,
  recurso,
}: PaywallCardProps) {
  const planoInfo = PLANO_INFO[recursoNecessario]
  const Icon = planoInfo.icon

  const tituloDefault =
    recursoNecessario === 'basic'
      ? 'Recurso disponível no plano BASIC'
      : 'Recurso exclusivo do plano PREMIUM'

  const descricaoDefault =
    recursoNecessario === 'basic'
      ? 'Faça upgrade para o plano BASIC e desbloqueie este recurso'
      : 'Faça upgrade para o plano PREMIUM e desbloqueie este recurso'

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${
              recursoNecessario === 'premium'
                ? 'from-purple-600 to-pink-600'
                : 'from-blue-600 to-cyan-600'
            } flex items-center justify-center`}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-white">{titulo || tituloDefault}</CardTitle>
        <CardDescription className="text-gray-400 text-base">
          {descricao || descricaoDefault}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plano Info */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon
                className={`w-5 h-5 ${
                  recursoNecessario === 'premium' ? 'text-purple-500' : 'text-blue-500'
                }`}
              />
              <span
                className={`font-bold text-lg ${
                  recursoNecessario === 'premium' ? 'text-purple-500' : 'text-blue-500'
                }`}
              >
                Plano {planoInfo.nome}
              </span>
            </div>
            <span className="text-white font-semibold">{planoInfo.preco}</span>
          </div>

          {/* Benefícios */}
          <ul className="space-y-2">
            {planoInfo.beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#8fbc8f] mt-0.5">✓</span>
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link href="/dashboard/assinatura" className="block">
          <Button
            className={`w-full font-semibold ${
              recursoNecessario === 'premium'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            } text-white`}
            size="lg"
          >
            Fazer Upgrade para {planoInfo.nome}
          </Button>
        </Link>

        {/* Plano Atual */}
        <p className="text-center text-xs text-gray-500">
          Seu plano atual: <span className="uppercase font-semibold">{planoAtual}</span>
        </p>
      </CardContent>
    </Card>
  )
}
