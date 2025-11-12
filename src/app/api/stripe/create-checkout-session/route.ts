import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Pegar dados do body
    const { priceId, planName } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'priceId é obrigatório' }, { status: 400 })
    }

    // Buscar ou criar customer_id do Stripe
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, nome')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Se não existe customer_id, criar um novo no Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.nome,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customerId = customer.id

      // Salvar customer_id no perfil
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/assinatura?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/planos?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno ao criar checkout' },
      { status: 500 }
    )
  }
}
