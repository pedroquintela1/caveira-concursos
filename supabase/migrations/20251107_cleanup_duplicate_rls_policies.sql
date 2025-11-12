-- =====================================================
-- Migration: Cleanup duplicate RLS policies
-- Description: Remove duplicate policies from config tables
-- Date: 2025-11-07
-- =====================================================

-- ============================================================================
-- 1. DISCIPLINAS - Manter apenas "Public can view active disciplinas"
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view disciplinas" ON disciplinas;
DROP POLICY IF EXISTS "disciplinas_select_all" ON disciplinas;

-- Garantir que a policy correta existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'disciplinas'
    AND policyname = 'Public can view active disciplinas'
  ) THEN
    CREATE POLICY "Public can view active disciplinas"
      ON disciplinas FOR SELECT
      TO public
      USING (is_active = TRUE);
  END IF;
END $$;

-- ============================================================================
-- 2. BANCAS - Manter apenas "bancas_select_all"
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view bancas" ON bancas;

-- Garantir que a policy correta existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bancas'
    AND policyname = 'bancas_select_all'
  ) THEN
    CREATE POLICY "bancas_select_all"
      ON bancas FOR SELECT
      TO public
      USING (is_active = TRUE);
  END IF;
END $$;

-- ============================================================================
-- 3. ORGAOS - Manter apenas "orgaos_select_all"
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view orgaos" ON orgaos;

-- Garantir que a policy correta existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orgaos'
    AND policyname = 'orgaos_select_all'
  ) THEN
    CREATE POLICY "orgaos_select_all"
      ON orgaos FOR SELECT
      TO public
      USING (is_active = TRUE);
  END IF;
END $$;

-- ============================================================================
-- 4. ASSUNTOS - Manter apenas "Public can view all assuntos"
-- ============================================================================

DROP POLICY IF EXISTS "assuntos_select_all" ON assuntos;

-- Garantir que a policy correta existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assuntos'
    AND policyname = 'Public can view all assuntos'
  ) THEN
    CREATE POLICY "Public can view all assuntos"
      ON assuntos FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  policy_count INT;
BEGIN
  -- Contar policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('disciplinas', 'bancas', 'orgaos', 'assuntos', 'areas_carreira', 'formacoes');

  RAISE NOTICE '✅ Limpeza de policies concluída!';
  RAISE NOTICE 'ℹ️  Total de policies ativas: %', policy_count;
  RAISE NOTICE 'ℹ️  Esperado: 6 policies (1 por tabela)';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
