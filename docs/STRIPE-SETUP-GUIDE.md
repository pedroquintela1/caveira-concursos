# Guia de Configuração do Stripe - KAV Concursos

**Status:** ✅ Implementação completa
**Data:** 02/11/2025
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Stripe Dashboard](#configuração-do-stripe-dashboard)
4. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
5. [Testando a Integração](#testando-a-integração)
6. [Produção](#produção)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A integração do Stripe permite que o KAV Concursos:
- ✅ Aceite pagamentos recorrentes (assinaturas)
- ✅ Gerencie upgrades/downgrades automáticos
- ✅ Ofereça portal de autoatendimento para clientes
- ✅ Processe webhooks para sincronizar status de assinatura

**Planos implementados:**
- **BASIC:** R$ 39,90/mês
- **PREMIUM:** R$ 79,90/mês

---

## 🔧 Pré-requisitos

1. **Conta no Stripe:** [stripe.com/register](https://stripe.com/register)
2. **Migration aplicada:** Campos Stripe na tabela `profiles`
3. **Dependências instaladas:**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

---

## 🛠️ Configuração do Stripe Dashboard

### Passo 1: Criar Produtos e Preços

1. Acesse **Dashboard → Products** ([https://dashboard.stripe.com/products](https://dashboard.stripe.com/products))

2. **Criar produto BASIC:**
   - Nome: `KAV Concursos - Plano BASIC`
   - Descrição: `Acesso ao plano BASIC com 10 cadernos, comentários e estatísticas avançadas`
   - **Adicionar preço recorrente:**
     - Valor: `R$ 39,90` (3990 centavos)
     - Frequência: `Mensal`
     - Modelo de cobrança: `Padrão (cobrar automaticamente)`
   - **Copiar o `Price ID`** (formato: `price_xxxxxxxxxxxxx`)

3. **Criar produto PREMIUM:**
   - Nome: `KAV Concursos - Plano PREMIUM`
   - Descrição: `Acesso total ao plano PREMIUM com cadernos ilimitados, IA e materiais extras`
   - **Adicionar preço recorrente:**
     - Valor: `R$ 79,90` (7990 centavos)
     - Frequência: `Mensal`
     - Modelo de cobrança: `Padrão (cobrar automaticamente)`
   - **Copiar o `Price ID`** (formato: `price_xxxxxxxxxxxxx`)

### Passo 2: Configurar Webhook

1. Acesse **Developers → Webhooks** ([https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks))

2. Clique em **Add endpoint**

3. **Configurações:**
   - **URL do endpoint:**
     - **Desenvolvimento:** `https://seu-dominio-ngrok.ngrok.io/api/stripe/webhooks`
     - **Produção:** `https://kavconcursos.com.br/api/stripe/webhooks`

   - **Eventos a escutar:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Copiar o `Signing secret`** (formato: `whsec_xxxxxxxxxxxxx`)

### Passo 3: Obter API Keys

1. Acesse **Developers → API keys** ([https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys))

2. **Para Desenvolvimento (Test mode):**
   - **Publishable key:** `pk_test_xxxxxxxxxxxxx` (pode ser exposta no frontend)
   - **Secret key:** `sk_test_xxxxxxxxxxxxx` (NUNCA expor no frontend)

3. **Para Produção (Live mode):**
   - Ative o Live mode no toggle superior
   - **Publishable key:** `pk_live_xxxxxxxxxxxxx`
   - **Secret key:** `sk_live_xxxxxxxxxxxxx`

---

## 🔐 Configuração das Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# ========================================
# STRIPE (Pagamentos)
# ========================================

# Test mode (desenvolvimento)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SEU_PUBLISHABLE_KEY_AQUI
STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Price IDs dos produtos (copie do dashboard)
STRIPE_PRICE_BASIC_MONTHLY=price_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_PRICE_PREMIUM_MONTHLY=price_XXXXXXXXXXXXXXXXXXXXXXXX

# App URL (para redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env` no Git
- Para produção, configure as mesmas variáveis no Vercel/servidor
- Use valores `pk_live_` e `sk_live_` em produção

---

## 🧪 Testando a Integração

### 1. Testar Checkout (Modo de Teste)

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000/dashboard/planos`

3. Clique em **"Assinar BASIC"** ou **"Assinar PREMIUM"**

4. Use cartão de teste do Stripe:
   - **Número:** `4242 4242 4242 4242`
   - **Validade:** Qualquer data futura (ex: `12/34`)
   - **CVC:** Qualquer 3 dígitos (ex: `123`)
   - **CEP:** Qualquer CEP válido

5. Complete o checkout

6. **Verificar sucesso:**
   - Redirecionado para `/dashboard/assinatura?success=true`
   - Plano atualizado no dashboard
   - Webhook recebido (veja logs do terminal)

### 2. Testar Webhook Localmente (com ngrok)

Para testar webhooks localmente, você precisa expor o localhost:

1. **Instale o ngrok:** [ngrok.com/download](https://ngrok.com/download)

2. **Inicie o ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copie a URL gerada** (ex: `https://abcd1234.ngrok.io`)

4. **Configure o webhook no Stripe:**
   - URL: `https://abcd1234.ngrok.io/api/stripe/webhooks`
   - Copie o novo `whsec_` secret e atualize o `.env`

5. **Faça um teste de checkout** e veja os eventos chegarem em tempo real

### 3. Testar Customer Portal

1. Após ter uma assinatura ativa:
   - Acesse `/dashboard/assinatura`
   - Clique em **"Gerenciar Assinatura"**
   - Teste cancelar, reativar, atualizar cartão, etc.

---

## 🚀 Produção

### Checklist antes de ir para produção:

- [ ] **Stripe em Live Mode:**
  - [ ] Ativar Live mode no dashboard
  - [ ] Copiar `pk_live_` e `sk_live_`
  - [ ] Atualizar variáveis de ambiente no servidor

- [ ] **Webhook configurado:**
  - [ ] URL de produção: `https://kavconcursos.com.br/api/stripe/webhooks`
  - [ ] `whsec_` de produção configurado no servidor

- [ ] **Price IDs de produção:**
  - [ ] Criar produtos em Live mode
  - [ ] Atualizar `STRIPE_PRICE_BASIC_MONTHLY` e `STRIPE_PRICE_PREMIUM_MONTHLY`

- [ ] **Configurar no Vercel** (ou servidor):
  ```bash
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
  STRIPE_SECRET_KEY=sk_live_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_PRICE_BASIC_MONTHLY=price_xxx
  STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
  NEXT_PUBLIC_APP_URL=https://kavconcursos.com.br
  ```

- [ ] **Testar fluxo completo em produção:**
  - [ ] Compra de assinatura
  - [ ] Webhook de confirmação
  - [ ] Portal do cliente
  - [ ] Cancelamento

---

## 🐛 Troubleshooting

### Erro: "STRIPE_SECRET_KEY não está definida"

**Causa:** Variável de ambiente não configurada ou mal formatada

**Solução:**
1. Verifique o arquivo `.env`
2. Certifique-se de que não há espaços antes/depois do `=`
3. Reinicie o servidor: `npm run dev`

---

### Erro: "Webhook inválido" (400)

**Causa:** Assinatura do webhook não está sendo validada corretamente

**Solução:**
1. Verifique se `STRIPE_WEBHOOK_SECRET` está correto no `.env`
2. Se testando localmente, use **ngrok** e configure webhook com URL do ngrok
3. Certifique-se de que o secret corresponde ao endpoint correto no dashboard

---

### Checkout não redireciona de volta

**Causa:** `NEXT_PUBLIC_APP_URL` incorreto

**Solução:**
1. Verifique se `NEXT_PUBLIC_APP_URL` está configurado
2. Em dev: `http://localhost:3000` (SEM barra final)
3. Em prod: `https://kavconcursos.com.br` (SEM barra final)

---

### Plano não atualiza após pagamento

**Causa:** Webhook não está sendo recebido ou processado

**Solução:**
1. Verifique logs do servidor para eventos do webhook
2. Acesse **Stripe Dashboard → Developers → Webhooks**
3. Clique no webhook e veja o histórico de eventos
4. Se eventos falharam, clique em "Resend" para reenviar

---

### Usuário tem assinatura mas plano ainda é FREE

**Causa:** Webhook não atualizou o banco de dados

**Solução (manual):**
1. Acesse o Supabase dashboard
2. Vá em **SQL Editor**
3. Execute:
   ```sql
   UPDATE profiles
   SET plano = 'basic',  -- ou 'premium'
       stripe_subscription_status = 'active'
   WHERE email = 'email@usuario.com';
   ```

---

## 📚 Recursos Adicionais

- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Testing:** [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Webhooks:** [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Customer Portal:** [stripe.com/docs/billing/subscriptions/integrating-customer-portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

## 📁 Arquitetura Implementada

```
src/
├── lib/stripe/
│   ├── config.ts         # Stripe SDK (server-side)
│   └── client.ts         # Stripe.js (client-side)
│
├── components/stripe/
│   ├── checkout-button.tsx           # Botão de checkout
│   ├── pricing-card.tsx              # Card de plano
│   └── manage-subscription-button.tsx # Botão do portal
│
└── app/api/stripe/
    ├── create-checkout-session/route.ts  # Cria sessão de checkout
    ├── create-portal-session/route.ts    # Abre portal do cliente
    └── webhooks/route.ts                 # Recebe eventos do Stripe
```

---

## 🎉 Pronto!

A integração do Stripe está **completa e funcional**. Basta configurar as chaves e começar a aceitar pagamentos!

Para dúvidas ou problemas, consulte a [documentação oficial do Stripe](https://stripe.com/docs) ou abra uma issue no repositório.
