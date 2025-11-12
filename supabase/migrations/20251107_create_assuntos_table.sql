-- =====================================================
-- Migration: Create assuntos table
-- Description: Topics/subjects within disciplines (hierarchical structure)
-- Date: 2025-11-07
-- =====================================================

-- Create table
CREATE TABLE IF NOT EXISTS assuntos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  disciplina_id INT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  parent_id INT REFERENCES assuntos(id) ON DELETE CASCADE, -- Para hierarquia (subassuntos)
  nivel INT DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 5), -- 1=principal, 2-5=subníveis
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: nome único dentro de cada disciplina
  UNIQUE(nome, disciplina_id)
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_assuntos_disciplina ON assuntos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_assuntos_parent ON assuntos(parent_id);
CREATE INDEX IF NOT EXISTS idx_assuntos_ordem ON assuntos(ordem);
CREATE INDEX IF NOT EXISTS idx_assuntos_nivel ON assuntos(nivel);

-- Enable RLS
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access (anyone can view all assuntos)
DROP POLICY IF EXISTS "Public can view all assuntos" ON assuntos;
CREATE POLICY "Public can view all assuntos"
  ON assuntos FOR SELECT
  TO public
  USING (true);

-- Add comments
COMMENT ON TABLE assuntos IS 'Assuntos/tópicos das disciplinas com suporte a hierarquia (para filtros e estatísticas)';
COMMENT ON COLUMN assuntos.parent_id IS 'ID do assunto pai (null = assunto raiz)';
COMMENT ON COLUMN assuntos.nivel IS 'Nível na hierarquia: 1=principal, 2-5=subníveis';

-- ============================================================================
-- SEED DATA: Assuntos iniciais para Direito Penal Militar
-- ============================================================================

-- Primeiro, precisamos pegar o ID da disciplina "Direito Processual Penal"
-- Vamos inserir assuntos de exemplo

DO $$
DECLARE
  disciplina_penal_id INT;
  disciplina_constitucional_id INT;
  assunto_pai_id INT;
BEGIN
  -- Buscar ID do Direito Processual Penal
  SELECT id INTO disciplina_penal_id FROM disciplinas WHERE slug = 'direito-processual-penal' LIMIT 1;

  -- Buscar ID do Direito Constitucional
  SELECT id INTO disciplina_constitucional_id FROM disciplinas WHERE slug = 'direito-constitucional' LIMIT 1;

  -- Inserir assuntos de Direito Processual Penal (se disciplina existir)
  IF disciplina_penal_id IS NOT NULL THEN
    -- Assuntos principais (nível 1)
    INSERT INTO assuntos (nome, disciplina_id, nivel, ordem) VALUES
      ('Inquérito Policial Militar', disciplina_penal_id, 1, 1),
      ('Ação Penal Militar', disciplina_penal_id, 1, 2),
      ('Competência da Justiça Militar', disciplina_penal_id, 1, 3),
      ('Prisão e Liberdade Provisória', disciplina_penal_id, 1, 4),
      ('Processo Penal Militar', disciplina_penal_id, 1, 5),
      ('Recursos', disciplina_penal_id, 1, 6)
    ON CONFLICT (nome, disciplina_id) DO NOTHING;

    -- Exemplo de subassunto (nível 2)
    SELECT id INTO assunto_pai_id FROM assuntos WHERE nome = 'Inquérito Policial Militar' AND disciplina_id = disciplina_penal_id LIMIT 1;

    IF assunto_pai_id IS NOT NULL THEN
      INSERT INTO assuntos (nome, disciplina_id, parent_id, nivel, ordem) VALUES
        ('Instauração do IPM', disciplina_penal_id, assunto_pai_id, 2, 1),
        ('Indiciamento', disciplina_penal_id, assunto_pai_id, 2, 2),
        ('Conclusão do IPM', disciplina_penal_id, assunto_pai_id, 2, 3)
      ON CONFLICT (nome, disciplina_id) DO NOTHING;
    END IF;
  END IF;

  -- Inserir assuntos de Direito Constitucional (se disciplina existir)
  IF disciplina_constitucional_id IS NOT NULL THEN
    INSERT INTO assuntos (nome, disciplina_id, nivel, ordem) VALUES
      ('Princípios Fundamentais', disciplina_constitucional_id, 1, 1),
      ('Direitos e Garantias Fundamentais', disciplina_constitucional_id, 1, 2),
      ('Organização do Estado', disciplina_constitucional_id, 1, 3),
      ('Organização dos Poderes', disciplina_constitucional_id, 1, 4),
      ('Defesa do Estado e das Instituições Democráticas', disciplina_constitucional_id, 1, 5),
      ('Segurança Pública', disciplina_constitucional_id, 1, 6)
    ON CONFLICT (nome, disciplina_id) DO NOTHING;

    -- Subassuntos de Direitos e Garantias Fundamentais
    SELECT id INTO assunto_pai_id FROM assuntos WHERE nome = 'Direitos e Garantias Fundamentais' AND disciplina_id = disciplina_constitucional_id LIMIT 1;

    IF assunto_pai_id IS NOT NULL THEN
      INSERT INTO assuntos (nome, disciplina_id, parent_id, nivel, ordem) VALUES
        ('Direitos Individuais', disciplina_constitucional_id, assunto_pai_id, 2, 1),
        ('Direitos Coletivos', disciplina_constitucional_id, assunto_pai_id, 2, 2),
        ('Direitos Sociais', disciplina_constitucional_id, assunto_pai_id, 2, 3),
        ('Remédios Constitucionais', disciplina_constitucional_id, assunto_pai_id, 2, 4)
      ON CONFLICT (nome, disciplina_id) DO NOTHING;
    END IF;
  END IF;

  RAISE NOTICE '✅ Assuntos criados com sucesso!';

END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
