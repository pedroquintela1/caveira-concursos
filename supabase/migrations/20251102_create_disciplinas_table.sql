-- =====================================================
-- Migration: Create disciplinas table
-- Description: Disciplines/subjects for public exams
-- Date: 2025-11-02
-- =====================================================

-- Create table
CREATE TABLE IF NOT EXISTS disciplinas (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  icone TEXT,                         -- Lucide React icon name (e.g., 'Scale', 'Gavel')
  ordem INT DEFAULT 0,
  cor_destaque TEXT DEFAULT '#2563EB', -- UI accent color (hex)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_disciplinas_slug ON disciplinas(slug);
CREATE INDEX IF NOT EXISTS idx_disciplinas_ordem ON disciplinas(ordem);

-- Enable RLS
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access (anyone can view active disciplines)
DROP POLICY IF EXISTS "Public can view active disciplinas" ON disciplinas;
CREATE POLICY "Public can view active disciplinas"
  ON disciplinas FOR SELECT
  USING (is_active = TRUE);

-- Seed data: Core disciplines for public exams
INSERT INTO disciplinas (nome, slug, icone, ordem, cor_destaque) VALUES
  ('Direito Constitucional', 'direito-constitucional', 'Scale', 1, '#3B82F6'),
  ('Direito Penal', 'direito-penal', 'Gavel', 2, '#EF4444'),
  ('Direito Processual Penal', 'direito-processual-penal', 'FileText', 3, '#F59E0B'),
  ('Direito Administrativo', 'direito-administrativo', 'Building', 4, '#10B981'),
  ('Direito Civil', 'direito-civil', 'Users', 5, '#8B5CF6'),
  ('Legislação Especial', 'legislacao-especial', 'BookOpen', 6, '#6366F1')
ON CONFLICT (slug) DO NOTHING;

-- Add comment
COMMENT ON TABLE disciplinas IS 'Disciplinas/matérias dos concursos públicos (ex: Direito Penal, Direito Constitucional)';
