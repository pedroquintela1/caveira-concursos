import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Usar Supabase com service_role key para bypass RLS policies
// Se não tiver a chave, webhook não funcionará mas build não quebra
const supabaseAdmin =
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

/**
 * Webhook handler do Stripe
 *
 * Eventos tratados:
 * - checkout.session.completed: Quando o pagamento inicial é concluído
 * - customer.subscription.created: Quando uma nova assinatura é criada
 * - customer.subscription.updated: Quando a assinatura é atualizada (upgrade/downgrade)
 * - customer.subscription.deleted: Quando a assinatura é cancelada
 * - invoice.payment_succeeded: Quando um pagamento recorrente é bem-sucedido
 * - invoice.payment_failed: Quando um pagamento falha
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Erro ao verificar webhook:', error.message)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  console.log(`[Webhook] Evento recebido: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Pegar subscription do Stripe
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await handleSubscriptionChange(subscription)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] Pagamento bem-sucedido: ${invoice.id}`)
        // Opcional: registrar histórico de pagamentos
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] Pagamento falhou: ${invoice.id}`)
        // Opcional: notificar usuário sobre falha no pagamento
        break
      }

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

/**
 * Atualiza o plano do usuário quando a assinatura é criada/atualizada
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) {
    console.error('[Webhook] supabaseAdmin não configurado (falta SUPABASE_SERVICE_ROLE_KEY)')
    return
  }

  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('[Webhook] user_id ausente nos metadados da assinatura')
    return
  }

  // Determinar o plano baseado no price_id
  const priceId = subscription.items.data[0]?.price.id
  let plano: 'free' | 'basic' | 'premium' = 'free'

  if (priceId === process.env.STRIPE_PRICE_BASIC_MONTHLY) {
    plano = 'basic'
  } else if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) {
    plano = 'premium'
  }

  // Determinar status da assinatura
  const isActive = ['active', 'trialing'].includes(subscription.status)

  if (!isActive) {
    plano = 'free'
  }

  console.log(`[Webhook] Atualizando usuário ${userId} para plano ${plano}`)

  // Atualizar perfil do usuário
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plano,
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      stripe_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[Webhook] Erro ao atualizar perfil:', error)
    throw error
  }

  console.log(`[Webhook] Perfil atualizado com sucesso`)
}

/**
 * Downgrade para FREE quando a assinatura é cancelada
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) {
    console.error('[Webhook] supabaseAdmin não configurado (falta SUPABASE_SERVICE_ROLE_KEY)')
    return
  }

  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('[Webhook] user_id ausente nos metadados da assinatura')
    return
  }

  console.log(`[Webhook] Cancelando assinatura do usuário ${userId}`)

  // Downgrade para FREE
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plano: 'free',
      stripe_subscription_status: 'canceled',
      stripe_subscription_id: null,
      stripe_current_period_end: null,
    })
    .eq('id', userId)

  if (error) {
    console.error('[Webhook] Erro ao cancelar assinatura:', error)
    throw error
  }

  console.log(`[Webhook] Assinatura cancelada com sucesso`)
}

// Desabilitar body parsing para webhooks do Stripe
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
