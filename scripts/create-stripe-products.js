#!/usr/bin/env node

/**
 * Script para criar produtos e preços no Stripe
 * Executa: node scripts/create-stripe-products.js
 */

const Stripe = require('stripe');

// Lê a chave do .env manualmente
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const stripeKeyMatch = envContent.match(/STRIPE_SECRET_KEY=(.+)/);
const STRIPE_SECRET_KEY = stripeKeyMatch ? stripeKeyMatch[1].trim() : '';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🚀 Criando produtos no Stripe...\n');

    // 1. Criar produto BASIC
    console.log('📦 Criando produto BASIC...');
    const basicProduct = await stripe.products.create({
      name: 'KAV Concursos - Plano BASIC',
      description: '10 cadernos, comentários da comunidade, questões ilimitadas',
    });
    console.log('✅ Produto BASIC criado:', basicProduct.id);

    // 2. Criar preço para BASIC (R$ 39,90/mês)
    console.log('💰 Criando preço BASIC (R$ 39,90/mês)...');
    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 3990, // R$ 39,90 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
    });
    console.log('✅ Preço BASIC criado:', basicPrice.id);
    console.log('');

    // 3. Criar produto PREMIUM
    console.log('📦 Criando produto PREMIUM...');
    const premiumProduct = await stripe.products.create({
      name: 'KAV Concursos - Plano PREMIUM',
      description: 'Cadernos ilimitados, IA, materiais extras (vídeos/PDFs)',
    });
    console.log('✅ Produto PREMIUM criado:', premiumProduct.id);

    // 4. Criar preço para PREMIUM (R$ 79,90/mês)
    console.log('💰 Criando preço PREMIUM (R$ 79,90/mês)...');
    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 7990, // R$ 79,90 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
    });
    console.log('✅ Preço PREMIUM criado:', premiumPrice.id);
    console.log('');

    // 5. Exibir resumo
    console.log('=================================================');
    console.log('✅ PRODUTOS CRIADOS COM SUCESSO!');
    console.log('=================================================');
    console.log('');
    console.log('📋 Adicione estes Price IDs ao seu .env:');
    console.log('');
    console.log(`STRIPE_PRICE_BASIC_MONTHLY=${basicPrice.id}`);
    console.log(`STRIPE_PRICE_PREMIUM_MONTHLY=${premiumPrice.id}`);
    console.log('');
    console.log('🔗 Links para visualizar no Dashboard:');
    console.log(`BASIC: https://dashboard.stripe.com/test/products/${basicProduct.id}`);
    console.log(`PREMIUM: https://dashboard.stripe.com/test/products/${premiumProduct.id}`);
    console.log('');
    console.log('=================================================');

    return {
      basic: { product: basicProduct.id, price: basicPrice.id },
      premium: { product: premiumProduct.id, price: premiumPrice.id },
    };
  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error.message);
    process.exit(1);
  }
}

// Executar
createProducts()
  .then((result) => {
    console.log('🎉 Configuração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
