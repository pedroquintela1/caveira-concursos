-- Fix: Permitir que usuários leiam seu próprio perfil completo (incluindo role)
-- Isso é necessário para o middleware verificar permissões admin

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Permitir SELECT do próprio perfil (necessário para middleware)
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Permitir UPDATE do próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Comentário: Esta migração corrige o problema onde o middleware
-- não conseguia ler o campo 'role' devido a políticas RLS restritivas
