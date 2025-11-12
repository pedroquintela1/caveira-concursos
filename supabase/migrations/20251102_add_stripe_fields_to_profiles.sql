-- Migration: Adicionar campos do Stripe à tabela profiles
-- Descrição: Adiciona campos para gerenciar assinaturas do Stripe
-- Data: 2025-11-02

-- Adicionar colunas do Stripe na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ;

-- Criar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_status ON profiles(stripe_subscription_status);

-- Comentários para documentação
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID do cliente no Stripe (cus_xxx)';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'ID da assinatura ativa no Stripe (sub_xxx)';
COMMENT ON COLUMN profiles.stripe_subscription_status IS 'Status da assinatura: active, canceled, past_due, etc.';
COMMENT ON COLUMN profiles.stripe_current_period_end IS 'Data de término do período atual da assinatura';
