-- =====================================================
-- Migration: Create leis table
-- Description: Brazilian laws/legislation studied for exams
-- Date: 2025-11-02
-- =====================================================

-- Create table
CREATE TABLE IF NOT EXISTS leis (
  id SERIAL PRIMARY KEY,
  disciplina_id INT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,                   -- e.g., "Constituição Federal de 1988"
  nome_curto TEXT NOT NULL,             -- e.g., "CF/88"
  sigla TEXT,                           -- e.g., "CF"
  numero_lei TEXT,                      -- e.g., "Lei 12.850/2013" (if applicable)

  ementa TEXT,                          -- Summary/description of the law
  data_publicacao DATE,
  link_oficial TEXT,                    -- URL to official text (Planalto/Senate)

  total_artigos INT DEFAULT 0,
  ordem INT DEFAULT 0,

  is_mais_cobrada BOOLEAN DEFAULT FALSE, -- "Most tested" badge
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_leis_disciplina_id ON leis(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_leis_sigla ON leis(sigla);
CREATE INDEX IF NOT EXISTS idx_leis_nome_curto ON leis(nome_curto);
CREATE INDEX IF NOT EXISTS idx_leis_ordem ON leis(ordem);

-- Enable RLS
ALTER TABLE leis ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access
DROP POLICY IF EXISTS "Public can view active leis" ON leis;
CREATE POLICY "Public can view active leis"
  ON leis FOR SELECT
  USING (is_active = TRUE);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leis_updated_at_trigger ON leis;
CREATE TRIGGER update_leis_updated_at_trigger
  BEFORE UPDATE ON leis
  FOR EACH ROW
  EXECUTE FUNCTION update_leis_updated_at();

-- Seed data: Core laws for MVP
INSERT INTO leis (disciplina_id, nome, nome_curto, sigla, numero_lei, ementa, data_publicacao, total_artigos, is_mais_cobrada, ordem) VALUES
  (
    1, -- Direito Constitucional
    'Constituição da República Federativa do Brasil de 1988',
    'CF/88',
    'CF',
    NULL,
    'Constituição Federal de 1988 - Norma fundamental e suprema do Brasil',
    '1988-10-05',
    250,
    TRUE,
    1
  ),
  (
    2, -- Direito Penal
    'Código Penal - Decreto-Lei nº 2.848, de 7 de dezembro de 1940',
    'Código Penal',
    'CP',
    'Decreto-Lei 2.848/1940',
    'Define crimes e penas no ordenamento jurídico brasileiro',
    '1940-12-07',
    361,
    TRUE,
    2
  ),
  (
    3, -- Direito Processual Penal
    'Código de Processo Penal - Decreto-Lei nº 3.689, de 3 de outubro de 1941',
    'CPP',
    'CPP',
    'Decreto-Lei 3.689/1941',
    'Regula o processo penal no Brasil',
    '1941-10-03',
    811,
    TRUE,
    3
  )
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE leis IS 'Legislações brasileiras estudadas para concursos públicos (CF/88, CP, CPP, etc.)';
COMMENT ON COLUMN leis.total_artigos IS 'Total de artigos da lei (atualizado manualmente ou via trigger)';
COMMENT ON COLUMN leis.is_mais_cobrada IS 'TRUE se a lei é frequentemente cobrada em provas';
