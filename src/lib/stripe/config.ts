/**
 * Stripe Configuration
 *
 * Server-side Stripe SDK configuration for handling subscriptions and payments.
 * NEVER expose STRIPE_SECRET_KEY to the client.
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida nas variáveis de ambiente')
}

/**
 * Stripe SDK instance (server-side only)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

/**
 * Planos disponíveis com seus IDs do Stripe
 */
export const STRIPE_PLANS = {
  basic: {
    name: 'BASIC',
    priceId: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    price: 39.9,
    features: [
      '10 cadernos simultâneos',
      '200 questões por caderno',
      'Questões ilimitadas por dia',
      'Sistema de comentários',
      'Organização em pastas',
      'Suporte prioritário',
    ] as string[],
  },
  premium: {
    name: 'PREMIUM',
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
    price: 79.9,
    features: [
      'Cadernos ilimitados',
      '500 questões por caderno',
      'Questões ilimitadas por dia',
      'Materiais extras (vídeos, PDFs)',
      'Cadernos inteligentes com IA',
      'Estatísticas avançadas',
      'Organização em pastas ilimitadas',
      'Comentários e interação completa',
      'Suporte VIP prioritário',
    ] as string[],
  },
}

/**
 * Mapeia lookup_key do Stripe para plano interno
 */
export function getPlanoFromLookupKey(lookupKey: string): 'free' | 'basic' | 'premium' {
  if (lookupKey.includes('basic')) return 'basic'
  if (lookupKey.includes('premium')) return 'premium'
  return 'free'
}

/**
 * Mapeia plano interno para price ID do Stripe
 */
export function getPriceIdFromPlano(plano: 'basic' | 'premium'): string {
  return STRIPE_PLANS[plano].priceId
}
