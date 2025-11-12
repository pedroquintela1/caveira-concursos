-- =====================================================
-- Migration: Create artigos tracking tables
-- Description: Track user progress, favorites, and personal notes
-- Date: 2025-11-02
-- =====================================================

-- =====================================================
-- TABLE 1: artigos_estudados
-- Purpose: Track which articles user has studied
-- =====================================================

CREATE TABLE IF NOT EXISTS artigos_estudados (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,
  estudado_em TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, artigo_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_artigos_estudados_user_id ON artigos_estudados(user_id);
CREATE INDEX IF NOT EXISTS idx_artigos_estudados_artigo_id ON artigos_estudados(artigo_id);
CREATE INDEX IF NOT EXISTS idx_artigos_estudados_data ON artigos_estudados(estudado_em);

-- RLS
ALTER TABLE artigos_estudados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own artigos_estudados" ON artigos_estudados;
CREATE POLICY "Users can view own artigos_estudados"
  ON artigos_estudados FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own artigos_estudados" ON artigos_estudados;
CREATE POLICY "Users can insert own artigos_estudados"
  ON artigos_estudados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own artigos_estudados" ON artigos_estudados;
CREATE POLICY "Users can delete own artigos_estudados"
  ON artigos_estudados FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE artigos_estudados IS 'Tracking de artigos marcados como "estudados" por cada usuário';

-- =====================================================
-- TABLE 2: artigos_favoritos
-- Purpose: Star/favorite articles for quick access
-- =====================================================

CREATE TABLE IF NOT EXISTS artigos_favoritos (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,
  favoritado_em TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, artigo_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_artigos_favoritos_user_id ON artigos_favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_artigos_favoritos_artigo_id ON artigos_favoritos(artigo_id);

-- RLS
ALTER TABLE artigos_favoritos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favoritos" ON artigos_favoritos;
CREATE POLICY "Users can manage own favoritos"
  ON artigos_favoritos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE artigos_favoritos IS 'Sistema de favoritos (estrela) para artigos importantes';

-- =====================================================
-- TABLE 3: artigos_notas
-- Purpose: Personal notes on articles (BASIC+ feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS artigos_notas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artigo_id INT NOT NULL REFERENCES artigos(id) ON DELETE CASCADE,

  conteudo TEXT NOT NULL CHECK (char_length(conteudo) >= 5 AND char_length(conteudo) <= 10000),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, artigo_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_artigos_notas_user_id ON artigos_notas(user_id);
CREATE INDEX IF NOT EXISTS idx_artigos_notas_artigo_id ON artigos_notas(artigo_id);

-- Full-text search on notes
CREATE INDEX IF NOT EXISTS idx_artigos_notas_conteudo_fts ON artigos_notas
  USING GIN(to_tsvector('portuguese', conteudo));

-- RLS
ALTER TABLE artigos_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notas" ON artigos_notas;
CREATE POLICY "Users can manage own notas"
  ON artigos_notas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artigos_notas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_artigos_notas_updated_at_trigger ON artigos_notas;
CREATE TRIGGER update_artigos_notas_updated_at_trigger
  BEFORE UPDATE ON artigos_notas
  FOR EACH ROW
  EXECUTE FUNCTION update_artigos_notas_updated_at();

-- Comment
COMMENT ON TABLE artigos_notas IS 'Notas pessoais dos usuários sobre artigos específicos (feature BASIC+)';
COMMENT ON COLUMN artigos_notas.conteudo IS 'Conteúdo da nota (5-10000 caracteres, suporta Markdown/HTML)';

-- =====================================================
-- FUNCTION: Get user progress on a specific law
-- =====================================================

CREATE OR REPLACE FUNCTION get_lei_progresso(p_lei_id INT, p_user_id UUID)
RETURNS TABLE (
  total_artigos BIGINT,
  artigos_estudados BIGINT,
  progresso_percentual NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(a.id) as total_artigos,
    COUNT(ae.artigo_id) as artigos_estudados,
    ROUND(
      (COUNT(ae.artigo_id)::NUMERIC / NULLIF(COUNT(a.id), 0)) * 100,
      1
    ) as progresso_percentual
  FROM artigos a
  LEFT JOIN artigos_estudados ae ON ae.artigo_id = a.id AND ae.user_id = p_user_id
  WHERE a.lei_id = p_lei_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_lei_progresso IS 'Calcula progresso do usuário em uma lei específica (total artigos, estudados, %)';

-- =====================================================
-- FUNCTION: Get user overall progress
-- =====================================================

CREATE OR REPLACE FUNCTION get_progresso_geral(p_user_id UUID)
RETURNS TABLE (
  total_leis_estudando BIGINT,
  total_artigos_estudados BIGINT,
  total_artigos_disponiveis BIGINT,
  progresso_percentual NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT l.id) as total_leis_estudando,
    COUNT(ae.artigo_id) as total_artigos_estudados,
    (SELECT COUNT(*) FROM artigos a JOIN leis l2 ON l2.id = a.lei_id WHERE l2.is_active = TRUE) as total_artigos_disponiveis,
    ROUND(
      (COUNT(ae.artigo_id)::NUMERIC / NULLIF(
        (SELECT COUNT(*) FROM artigos a2 JOIN leis l3 ON l3.id = a2.lei_id WHERE l3.is_active = TRUE),
        0
      )) * 100,
      1
    ) as progresso_percentual
  FROM artigos_estudados ae
  JOIN artigos a ON a.id = ae.artigo_id
  JOIN leis l ON l.id = a.lei_id
  WHERE ae.user_id = p_user_id AND l.is_active = TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_progresso_geral IS 'Calcula progresso geral do usuário em todas as leis ativas';
