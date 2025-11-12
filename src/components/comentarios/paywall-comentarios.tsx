'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface PaywallComentariosProps {
  planoAtual: 'free' | 'basic' | 'premium'
  tipo: 'leitura' | 'criacao' | 'votacao'
}

const MENSAGENS = {
  leitura: {
    titulo: 'Comentários disponíveis para BÁSICO+',
    descricao:
      'Veja o que outros estudantes e professores estão comentando sobre esta questão.',
    planoNecessario: 'basic',
    features: [
      'Leia comentários da comunidade',
      'Veja explicações de professores',
      'Aprenda com as discussões',
    ],
  },
  criacao: {
    titulo: 'Crie comentários com PREMIUM',
    descricao:
      'Participe das discussões, tire dúvidas e ajude outros estudantes.',
    planoNecessario: 'premium',
    features: [
      'Crie comentários ilimitados',
      'Edite nos primeiros 24h',
      'Vote em comentários',
      'Destaque suas dúvidas',
    ],
  },
  votacao: {
    titulo: 'Votação disponível para PREMIUM',
    descricao: 'Vote nos melhores comentários e ajude a destacar conteúdo útil.',
    planoNecessario: 'premium',
    features: [
      'Vote em comentários',
      'Destaque conteúdo útil',
      'Interaja com a comunidade',
    ],
  },
}

export function PaywallComentarios({ planoAtual, tipo }: PaywallComentariosProps) {
  const config = MENSAGENS[tipo]
  const isPremiumNecessario = config.planoNecessario === 'premium'

  return (
    <Card className="border-2 border-dashed border-gray-700 bg-gray-900/50">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        {/* Ícone */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
          {tipo === 'leitura' ? (
            <MessageSquare className="h-8 w-8 text-yellow-500" />
          ) : (
            <Crown className="h-8 w-8 text-yellow-500" />
          )}
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{config.titulo}</h3>
          <p className="text-sm text-gray-400">{config.descricao}</p>
        </div>

        {/* Features */}
        <ul className="space-y-2 text-left text-sm">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-3 w-3 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {feature}
            </li>
          ))}
        </ul>

        {/* Preço */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {isPremiumNecessario ? 'R$ 79,90' : 'R$ 39,90'}
          </span>
          <span className="text-sm text-gray-400">/mês</span>
        </div>

        {/* CTA */}
        <Link href="/dashboard/assinatura" className="w-full">
          <Button
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 hover:from-yellow-600 hover:to-orange-600"
            size="lg"
          >
            <Crown className="mr-2 h-5 w-5" />
            Fazer Upgrade para{' '}
            {isPremiumNecessario ? 'PREMIUM' : 'BÁSICO'}
          </Button>
        </Link>

        {/* Plano atual */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="h-3 w-3" />
          <span>
            Seu plano atual: <span className="uppercase font-semibold">{planoAtual}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
