-- =====================================================
-- Migration: Adicionar filtros faltantes em cadernos
-- Data: 10/11/2025
-- Descrição: Adiciona colunas de filtros que estavam
--            faltando na tabela cadernos (area_carreira,
--            formacao, escolaridade, regiao, assunto)
-- =====================================================

-- 1. Adicionar colunas de filtros faltantes
ALTER TABLE cadernos
ADD COLUMN IF NOT EXISTS area_carreira_id INT REFERENCES areas_carreira(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS formacao_id INT REFERENCES formacoes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS escolaridade TEXT CHECK (escolaridade IN ('fundamental', 'medio', 'superior', 'pos-graduacao')),
ADD COLUMN IF NOT EXISTS regiao TEXT CHECK (regiao IN ('norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'nacional')),
ADD COLUMN IF NOT EXISTS assunto_id INT REFERENCES assuntos(id) ON DELETE SET NULL;

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cadernos_area_carreira ON cadernos(area_carreira_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_formacao ON cadernos(formacao_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_escolaridade ON cadernos(escolaridade);
CREATE INDEX IF NOT EXISTS idx_cadernos_regiao ON cadernos(regiao);
CREATE INDEX IF NOT EXISTS idx_cadernos_assunto ON cadernos(assunto_id);

-- 3. Comentários nas colunas
COMMENT ON COLUMN cadernos.area_carreira_id IS 'Filtro: Área de carreira (Bombeiro, PM, etc.)';
COMMENT ON COLUMN cadernos.formacao_id IS 'Filtro: Formação acadêmica exigida';
COMMENT ON COLUMN cadernos.escolaridade IS 'Filtro: Nível de escolaridade (fundamental, medio, superior)';
COMMENT ON COLUMN cadernos.regiao IS 'Filtro: Região geográfica (norte, nordeste, etc.)';
COMMENT ON COLUMN cadernos.assunto_id IS 'Filtro: Assunto específico dentro da disciplina';

-- 4. Log da migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251110_add_missing_filters_to_cadernos aplicada!';
  RAISE NOTICE 'Colunas adicionadas: area_carreira_id, formacao_id, escolaridade, regiao, assunto_id';
END $$;
