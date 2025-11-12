-- =====================================================
-- Migration: Create artigos table
-- Description: Individual articles from Brazilian laws
-- Date: 2025-11-02
-- =====================================================

-- Create table
CREATE TABLE IF NOT EXISTS artigos (
  id SERIAL PRIMARY KEY,
  lei_id INT NOT NULL REFERENCES leis(id) ON DELETE CASCADE,

  numero TEXT NOT NULL,                 -- e.g., "Art. 121", "Art. 5º, LXXVIII"
  titulo TEXT,                          -- e.g., "Homicídio Simples" (optional)

  texto_completo TEXT NOT NULL CHECK (length(texto_completo) >= 5),
  texto_formatado TEXT,                 -- HTML with <strong> keywords (optional)

  capitulo TEXT,                        -- e.g., "Título I - Dos Direitos Fundamentais"
  secao TEXT,                           -- e.g., "Capítulo II - Dos Direitos Sociais"

  is_muito_cobrado BOOLEAN DEFAULT FALSE, -- "Highly tested" badge
  peso_edital INT DEFAULT 1 CHECK (peso_edital BETWEEN 1 AND 5), -- Importance: 1=low, 5=high

  ordem INT NOT NULL,                   -- Sequential order within the law
  palavras_chave TEXT[],                -- Keywords: e.g., ['homicídio', 'matar', 'doloso']

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(lei_id, numero)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_artigos_lei_id ON artigos(lei_id);
CREATE INDEX IF NOT EXISTS idx_artigos_numero ON artigos(numero);
CREATE INDEX IF NOT EXISTS idx_artigos_ordem ON artigos(lei_id, ordem);
CREATE INDEX IF NOT EXISTS idx_artigos_muito_cobrado ON artigos(is_muito_cobrado) WHERE is_muito_cobrado = TRUE;

-- GIN index for keywords array
CREATE INDEX IF NOT EXISTS idx_artigos_palavras_chave ON artigos USING GIN(palavras_chave);

-- Full-text search index (Portuguese)
CREATE INDEX IF NOT EXISTS idx_artigos_texto_fts ON artigos
  USING GIN(to_tsvector('portuguese', texto_completo));

-- Enable RLS
ALTER TABLE artigos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access (artigos from active laws)
DROP POLICY IF EXISTS "Public can view active artigos" ON artigos;
CREATE POLICY "Public can view active artigos"
  ON artigos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM leis WHERE leis.id = artigos.lei_id AND leis.is_active = TRUE
  ));

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artigos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_artigos_updated_at_trigger ON artigos;
CREATE TRIGGER update_artigos_updated_at_trigger
  BEFORE UPDATE ON artigos
  FOR EACH ROW
  EXECUTE FUNCTION update_artigos_updated_at();

-- Add comments
COMMENT ON TABLE artigos IS 'Artigos individuais das leis brasileiras (ex: CF/88 Art. 5º)';
COMMENT ON COLUMN artigos.numero IS 'Número do artigo (ex: "Art. 121", "Art. 5º, LXXVIII")';
COMMENT ON COLUMN artigos.texto_completo IS 'Texto literal do artigo (Lei Seca)';
COMMENT ON COLUMN artigos.texto_formatado IS 'HTML com <strong> em palavras-chave (opcional)';
COMMENT ON COLUMN artigos.peso_edital IS 'Relevância em editais: 1=baixa, 5=altíssima (baseado em provas anteriores)';
COMMENT ON COLUMN artigos.is_muito_cobrado IS 'TRUE se o artigo é frequentemente cobrado (>50% de incidência)';
COMMENT ON COLUMN artigos.palavras_chave IS 'Array de palavras-chave para busca semântica';
