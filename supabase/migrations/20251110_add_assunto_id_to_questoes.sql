-- =====================================================
-- Migration: Adicionar assunto_id em questoes
-- Data: 10/11/2025
-- Descrição: Adiciona coluna assunto_id na tabela
--            questoes para permitir filtros por assunto
-- =====================================================

-- 1. Adicionar coluna assunto_id
ALTER TABLE questoes
ADD COLUMN IF NOT EXISTS assunto_id INT REFERENCES assuntos(id) ON DELETE SET NULL;

-- 2. Criar índice
CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto_id);

-- 3. Comentário
COMMENT ON COLUMN questoes.assunto_id IS 'Assunto específico dentro da disciplina (ex: Processo Penal dentro de Direito Penal)';

-- 4. Log
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251110_add_assunto_id_to_questoes aplicada!';
  RAISE NOTICE 'Coluna assunto_id adicionada em questoes';
END $$;
