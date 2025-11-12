-- =====================================================
-- Migration: Fix Cadernos Table Schema
-- Data: 04/11/2025
-- Descrição: Adiciona campos individuais para filtros
--            ao invés de usar apenas JSONB, facilitando
--            queries e garantindo consistência com a API
-- =====================================================

-- 1. Adicionar colunas de filtros individuais
ALTER TABLE cadernos
ADD COLUMN IF NOT EXISTS disciplina_id INT REFERENCES disciplinas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS banca_id INT REFERENCES bancas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS orgao_id INT REFERENCES orgaos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ano_inicio INT CHECK (ano_inicio >= 2000 AND ano_inicio <= 2100),
ADD COLUMN IF NOT EXISTS ano_fim INT CHECK (ano_fim >= 2000 AND ano_fim <= 2100),
ADD COLUMN IF NOT EXISTS dificuldade TEXT CHECK (dificuldade IN ('facil', 'media', 'dificil')),
ADD COLUMN IF NOT EXISTS limite_questoes INT DEFAULT 50 CHECK (limite_questoes > 0 AND limite_questoes <= 500);

-- 2. Adicionar constraint para garantir lógica de anos
ALTER TABLE cadernos
ADD CONSTRAINT check_ano_range CHECK (ano_fim IS NULL OR ano_inicio IS NULL OR ano_fim >= ano_inicio);

-- 3. Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_cadernos_disciplina ON cadernos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_banca ON cadernos(banca_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_orgao ON cadernos(orgao_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_user_ativo ON cadernos(user_id, is_ativo);
CREATE INDEX IF NOT EXISTS idx_cadernos_pasta ON cadernos(pasta_id) WHERE pasta_id IS NOT NULL;

-- 4. Comentários nas colunas para documentação
COMMENT ON COLUMN cadernos.disciplina_id IS 'Filtro: Disciplina específica (ex: Direito Penal)';
COMMENT ON COLUMN cadernos.banca_id IS 'Filtro: Banca organizadora (ex: FCC, CESPE)';
COMMENT ON COLUMN cadernos.orgao_id IS 'Filtro: Órgão do concurso (ex: PM-SP, PRF)';
COMMENT ON COLUMN cadernos.ano_inicio IS 'Filtro: Ano inicial para questões (ex: 2020)';
COMMENT ON COLUMN cadernos.ano_fim IS 'Filtro: Ano final para questões (ex: 2024)';
COMMENT ON COLUMN cadernos.dificuldade IS 'Filtro: Nível de dificuldade (facil, media, dificil)';
COMMENT ON COLUMN cadernos.limite_questoes IS 'Número máximo de questões neste caderno (50-500)';
COMMENT ON COLUMN cadernos.filtros IS 'DEPRECATED: Usar campos individuais ao invés de JSONB';

-- 5. Log da migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251104_fix_cadernos_schema aplicada com sucesso!';
  RAISE NOTICE 'Campos adicionados: disciplina_id, banca_id, orgao_id, ano_inicio, ano_fim, dificuldade, limite_questoes';
  RAISE NOTICE 'Índices criados para melhorar performance';
END $$;
